import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_META_MUSE_BASE_URL,
  MetaMuseProvider,
  parseMetaMuseAnswer,
  parseMetaMuseResponse,
  parseMetaMuseUsage,
} from "./metaMuse.ts";
import { AgentProviderError } from "./types.ts";

test("calls the Meta Responses API with bounded low reasoning", async () => {
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;
  const fetchMock = (async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedInit = init;

    return Response.json({
      id: "resp_123",
      model: "muse-spark-1.1",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "I build useful things." }],
        },
      ],
      usage: {
        input_tokens: 4_000,
        input_tokens_details: { cached_tokens: 2_000 },
        output_tokens: 600,
        output_tokens_details: { reasoning_tokens: 300 },
        total_tokens: 4_600,
      },
    });
  }) as typeof fetch;
  const provider = new MetaMuseProvider({
    apiKey: "meta-secret-key",
    fetch: fetchMock,
  });

  const result = await provider.generate({
    instructions: "Answer only from supplied context.",
    messages: [{ role: "user", content: "What do you build?" }],
  });

  assert.equal(capturedUrl, `${DEFAULT_META_MUSE_BASE_URL}/responses`);
  assert.equal(capturedInit?.method, "POST");
  assert.equal(
    new Headers(capturedInit?.headers).get("Authorization"),
    "Bearer meta-secret-key",
  );
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    model: "muse-spark-1.1",
    instructions: "Answer only from supplied context.",
    input: [{ role: "user", content: "What do you build?" }],
    reasoning: { effort: "low" },
    max_output_tokens: 1_200,
    tools: [],
  });
  assert.deepEqual(result, {
    answer: "I build useful things.",
    provider: "meta",
    model: "muse-spark-1.1",
    responseId: "resp_123",
    usage: {
      inputTokens: 4_000,
      cachedInputTokens: 2_000,
      outputTokens: 600,
      reasoningTokens: 300,
      totalTokens: 4_600,
    },
  });
});

test("normalizes top-level output text and alternate usage field names", () => {
  assert.equal(parseMetaMuseAnswer({ output_text: "  Hello.  " }), "Hello.");
  assert.deepEqual(
    parseMetaMuseUsage({
      prompt_tokens: 10,
      prompt_tokens_details: { cached_tokens: 4 },
      completion_tokens: 8,
      completion_tokens_details: { reasoning_tokens: 5 },
    }),
    {
      inputTokens: 10,
      cachedInputTokens: 4,
      outputTokens: 8,
      reasoningTokens: 5,
      totalTokens: 18,
    },
  );
});

test("streams text deltas from the Meta Responses API", async () => {
  const events = [
    { type: "response.output_text.delta", delta: "Hello" },
    { type: "response.output_text.delta", delta: " there." },
    {
      type: "response.completed",
      response: {
        id: "resp_stream",
        model: "muse-spark-1.1",
        output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "Hello there." }] }],
        usage: { input_tokens: 12, output_tokens: 3 },
      },
    },
  ];
  const provider = new MetaMuseProvider({
    apiKey: "meta-secret-key",
    fetch: (async (_url, init) => {
      assert.equal(JSON.parse(String(init?.body)).stream, true);
      return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""), {
        headers: { "Content-Type": "text/event-stream" },
      });
    }) as typeof fetch,
  });
  const deltas: string[] = [];

  const result = await provider.generate({
    messages: [{ role: "user", content: "Hello" }],
    onTextDelta: (delta) => deltas.push(delta),
  });

  assert.deepEqual(deltas, ["Hello", " there."]);
  assert.equal(result.answer, "Hello there.");
  assert.equal(result.responseId, "resp_stream");
  assert.equal(result.usage?.totalTokens, 15);
});

test("ignores reasoning and tool calls when extracting an answer", () => {
  assert.equal(
    parseMetaMuseAnswer({
      output: [
        { type: "reasoning", content: "private reasoning" },
        { type: "function_call", name: "search", arguments: "{}" },
        {
          type: "message",
          role: "assistant",
          content: [
            { type: "output_text", text: "Grounded " },
            { type: "output_text", text: "answer." },
          ],
        },
      ],
    }),
    "Grounded answer.",
  );
});

test("rejects a response without assistant text", () => {
  assert.throws(
    () =>
      parseMetaMuseResponse({
        output: [{ type: "function_call", name: "search", arguments: "{}" }],
      }),
    (error) =>
      error instanceof AgentProviderError && error.code === "invalid_response",
  );
});

test("returns sanitized upstream errors without reading the response body", async () => {
  const provider = new MetaMuseProvider({
    apiKey: "never-include-this-key",
    fetch: (async () =>
      new Response('{"error":"sensitive provider detail"}', {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch,
  });

  await assert.rejects(
    () =>
      provider.generate({
        messages: [{ role: "user", content: "Hello" }],
      }),
    (error) => {
      assert.ok(error instanceof AgentProviderError);
      assert.equal(error.code, "upstream");
      assert.equal(error.status, 429);
      assert.equal(error.retryable, true);
      assert.doesNotMatch(error.message, /never-include|sensitive provider/);
      return true;
    },
  );
});

test("aborts a provider call after the configured timeout", async () => {
  const fetchMock = ((
    _url: string | URL | Request,
    init?: RequestInit,
  ) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener(
        "abort",
        () => reject(new DOMException("Aborted", "AbortError")),
        { once: true },
      );
    })) as typeof fetch;
  const provider = new MetaMuseProvider({
    apiKey: "meta-secret-key",
    fetch: fetchMock,
    timeoutMs: 5,
  });

  await assert.rejects(
    () =>
      provider.generate({
        messages: [{ role: "user", content: "Hello" }],
      }),
    (error) =>
      error instanceof AgentProviderError && error.code === "timeout",
  );
});
