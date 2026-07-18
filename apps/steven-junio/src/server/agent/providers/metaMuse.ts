import { DEFAULT_MUSE_MAX_OUTPUT_TOKENS } from "./cost.ts";
import {
  AgentProviderError,
  type AgentProvider,
  type AgentProviderRequest,
  type AgentProviderResponse,
  type AgentUsage,
} from "./types.ts";

export const META_MUSE_PROVIDER_ID = "meta";
export const DEFAULT_META_MUSE_MODEL = "muse-spark-1.1";
export const DEFAULT_META_MUSE_BASE_URL = "https://api.meta.ai/v1";
export const DEFAULT_META_MUSE_TIMEOUT_MS = 30_000;

type Fetch = typeof fetch;

export type MetaMuseProviderOptions = {
  apiKey: string;
  baseUrl?: string;
  fetch?: Fetch;
  maxOutputTokens?: number;
  model?: string;
  timeoutMs?: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNonNegativeInteger(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0
    ? Number(value)
    : undefined;
}

function readNestedInteger(
  value: unknown,
  objectKeys: ReadonlyArray<string>,
  valueKey: string,
) {
  if (!isRecord(value)) return undefined;

  for (const objectKey of objectKeys) {
    const nested = value[objectKey];

    if (isRecord(nested)) {
      const count = readNonNegativeInteger(nested[valueKey]);
      if (count !== undefined) return count;
    }
  }

  return undefined;
}

export function parseMetaMuseUsage(value: unknown): AgentUsage | undefined {
  if (!isRecord(value)) return undefined;

  const inputTokens =
    readNonNegativeInteger(value.input_tokens) ??
    readNonNegativeInteger(value.prompt_tokens);
  const outputTokens =
    readNonNegativeInteger(value.output_tokens) ??
    readNonNegativeInteger(value.completion_tokens);

  if (inputTokens === undefined || outputTokens === undefined) {
    return undefined;
  }

  const cachedInputTokens =
    readNestedInteger(
      value,
      ["input_tokens_details", "prompt_tokens_details"],
      "cached_tokens",
    ) ?? 0;
  const reasoningTokens =
    readNestedInteger(
      value,
      ["output_tokens_details", "completion_tokens_details"],
      "reasoning_tokens",
    ) ?? readNonNegativeInteger(value.reasoning_tokens) ?? 0;
  const totalTokens =
    readNonNegativeInteger(value.total_tokens) ?? inputTokens + outputTokens;

  return {
    inputTokens,
    cachedInputTokens: Math.min(cachedInputTokens, inputTokens),
    outputTokens,
    reasoningTokens: Math.min(reasoningTokens, outputTokens),
    totalTokens,
  };
}

function textFromContent(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .filter(isRecord)
    .filter((part) => part.type === "output_text" || part.type === "text")
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("");
}

export function parseMetaMuseAnswer(value: unknown) {
  if (!isRecord(value)) return "";
  if (typeof value.output_text === "string") return value.output_text.trim();
  if (!Array.isArray(value.output)) return "";

  return value.output
    .filter(isRecord)
    .filter(
      (item) =>
        item.type === "message" &&
        (item.role === undefined || item.role === "assistant"),
    )
    .map((item) => textFromContent(item.content).trim())
    .filter(Boolean)
    .join("\n\n");
}

export function parseMetaMuseResponse(
  value: unknown,
  model = DEFAULT_META_MUSE_MODEL,
): AgentProviderResponse {
  if (!isRecord(value)) {
    throw new AgentProviderError("Meta Model API returned an invalid response.", {
      code: "invalid_response",
    });
  }

  const answer = parseMetaMuseAnswer(value);

  if (!answer) {
    throw new AgentProviderError(
      "Meta Model API returned no assistant answer.",
      { code: "invalid_response" },
    );
  }

  return {
    answer,
    provider: META_MUSE_PROVIDER_ID,
    model: typeof value.model === "string" ? value.model : model,
    responseId: typeof value.id === "string" ? value.id : undefined,
    usage: parseMetaMuseUsage(value.usage),
  };
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function streamDelta(value: unknown) {
  if (!isRecord(value)) return "";
  if (
    (value.type === "response.output_text.delta" || value.type === "output_text.delta") &&
    typeof value.delta === "string"
  ) {
    return value.delta;
  }

  if (!Array.isArray(value.choices)) return "";
  const choice = value.choices.find(isRecord);
  if (!choice || !isRecord(choice.delta)) return "";
  return typeof choice.delta.content === "string" ? choice.delta.content : "";
}

async function parseMetaMuseStream(
  response: Response,
  model: string,
  onTextDelta: (delta: string) => void,
) {
  if (!response.body) {
    throw new AgentProviderError("Meta Model API returned an empty stream.", {
      code: "invalid_response",
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let completed: unknown;

  const consume = (line: string) => {
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;

    let event: unknown;
    try {
      event = JSON.parse(data);
    } catch {
      return;
    }

    const delta = streamDelta(event);
    if (delta) {
      answer += delta;
      onTextDelta(delta);
    }
    if (isRecord(event) && event.type === "response.completed") {
      completed = event.response;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    lines.forEach(consume);
    if (done) break;
  }
  if (buffer) consume(buffer);

  if (completed) {
    const parsed = parseMetaMuseResponse(completed, model);
    if (!answer) {
      answer = parsed.answer;
      onTextDelta(answer);
    }
    return { ...parsed, answer: answer.trim() };
  }
  if (!answer.trim()) {
    throw new AgentProviderError("Meta Model API returned no streamed answer.", {
      code: "invalid_response",
    });
  }
  return {
    answer: answer.trim(),
    provider: META_MUSE_PROVIDER_ID,
    model,
  };
}

export class MetaMuseProvider implements AgentProvider {
  readonly id = META_MUSE_PROVIDER_ID;
  readonly model: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: Fetch;
  private readonly maxOutputTokens: number;
  private readonly timeoutMs: number;

  constructor(options: MetaMuseProviderOptions) {
    const apiKey = options.apiKey.trim();

    if (!apiKey) {
      throw new AgentProviderError("A Meta Model API key is required.", {
        code: "configuration",
      });
    }

    if (
      options.maxOutputTokens !== undefined &&
      (!Number.isSafeInteger(options.maxOutputTokens) ||
        options.maxOutputTokens < 1)
    ) {
      throw new AgentProviderError(
        "maxOutputTokens must be a positive safe integer.",
        { code: "configuration" },
      );
    }

    if (
      options.timeoutMs !== undefined &&
      (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
    ) {
      throw new AgentProviderError("timeoutMs must be greater than zero.", {
        code: "configuration",
      });
    }

    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_META_MUSE_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.fetchImpl = options.fetch ?? fetch;
    this.maxOutputTokens =
      options.maxOutputTokens ?? DEFAULT_MUSE_MAX_OUTPUT_TOKENS;
    this.model = options.model ?? DEFAULT_META_MUSE_MODEL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_META_MUSE_TIMEOUT_MS;
  }

  async generate(
    request: AgentProviderRequest,
  ): Promise<AgentProviderResponse> {
    if (!request.messages.length) {
      throw new AgentProviderError("At least one message is required.", {
        code: "configuration",
      });
    }

    if (request.signal?.aborted) {
      throw new AgentProviderError("Agent provider request was aborted.", {
        code: "aborted",
      });
    }

    const controller = new AbortController();
    const onAbort = () => controller.abort(request.signal?.reason);
    request.signal?.addEventListener("abort", onAbort, { once: true });
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.baseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          instructions: request.instructions,
          input: request.messages,
          reasoning: { effort: "low" },
          max_output_tokens: this.maxOutputTokens,
          tools: [],
          ...(request.onTextDelta ? { stream: true } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AgentProviderError(
          `Meta Model API request failed with status ${response.status}.`,
          {
            code: "upstream",
            retryable: isRetryableStatus(response.status),
            status: response.status,
          },
        );
      }

      if (request.onTextDelta) {
        return await parseMetaMuseStream(
          response,
          this.model,
          request.onTextDelta,
        );
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch (error) {
        throw new AgentProviderError(
          "Meta Model API returned malformed JSON.",
          { code: "invalid_response", cause: error },
        );
      }

      return parseMetaMuseResponse(payload, this.model);
    } catch (error) {
      if (error instanceof AgentProviderError) throw error;

      if (controller.signal.aborted) {
        if (request.signal?.aborted) {
          throw new AgentProviderError("Agent provider request was aborted.", {
            code: "aborted",
            cause: error,
          });
        }

        throw new AgentProviderError("Meta Model API request timed out.", {
          code: "timeout",
          retryable: true,
          cause: error,
        });
      }

      throw new AgentProviderError("Meta Model API request failed.", {
        code: "network",
        retryable: true,
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", onAbort);
    }
  }
}

export function createMetaMuseProvider(options: MetaMuseProviderOptions) {
  return new MetaMuseProvider(options);
}
