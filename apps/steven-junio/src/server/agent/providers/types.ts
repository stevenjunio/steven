export type AgentMessageRole = "user" | "assistant";

export type AgentMessage = {
  role: AgentMessageRole;
  content: string;
};

export type AgentProviderRequest = {
  instructions?: string;
  messages: ReadonlyArray<AgentMessage>;
  signal?: AbortSignal;
};

export type AgentUsage = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
};

export type AgentProviderResponse = {
  answer: string;
  provider: string;
  model: string;
  responseId?: string;
  usage?: AgentUsage;
};

export interface AgentProvider {
  readonly id: string;
  readonly model: string;

  generate(request: AgentProviderRequest): Promise<AgentProviderResponse>;
}

export type AgentProviderErrorCode =
  | "aborted"
  | "configuration"
  | "invalid_response"
  | "network"
  | "timeout"
  | "upstream";

export class AgentProviderError extends Error {
  readonly code: AgentProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(
    message: string,
    options: {
      code: AgentProviderErrorCode;
      retryable?: boolean;
      status?: number;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "AgentProviderError";
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.status = options.status;
  }
}
