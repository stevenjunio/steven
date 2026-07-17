import type { AgentUsage } from "./types.ts";

export const MUSE_SPARK_PRICING_USD_PER_MILLION = {
  input: 1.25,
  cachedInput: 0.15,
  output: 4.25,
} as const;

export const DEFAULT_MUSE_MAX_OUTPUT_TOKENS = 1_200;

export type MuseCostInput = {
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
};

export type MuseCostBreakdown = {
  uncachedInputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  uncachedInputUsd: number;
  cachedInputUsd: number;
  outputUsd: number;
  totalUsd: number;
};

function assertTokenCount(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer.`);
  }
}

function tokenCost(tokens: number, usdPerMillion: number) {
  return Math.round(((tokens * usdPerMillion) / 1_000_000) * 1e12) / 1e12;
}

export function estimateMuseCost({
  inputTokens,
  cachedInputTokens = 0,
  outputTokens,
}: MuseCostInput): MuseCostBreakdown {
  assertTokenCount("inputTokens", inputTokens);
  assertTokenCount("cachedInputTokens", cachedInputTokens);
  assertTokenCount("outputTokens", outputTokens);

  if (cachedInputTokens > inputTokens) {
    throw new RangeError("cachedInputTokens cannot exceed inputTokens.");
  }

  const uncachedInputTokens = inputTokens - cachedInputTokens;
  const uncachedInputUsd = tokenCost(
    uncachedInputTokens,
    MUSE_SPARK_PRICING_USD_PER_MILLION.input,
  );
  const cachedInputUsd = tokenCost(
    cachedInputTokens,
    MUSE_SPARK_PRICING_USD_PER_MILLION.cachedInput,
  );
  const outputUsd = tokenCost(
    outputTokens,
    MUSE_SPARK_PRICING_USD_PER_MILLION.output,
  );

  return {
    uncachedInputTokens,
    cachedInputTokens,
    outputTokens,
    uncachedInputUsd,
    cachedInputUsd,
    outputUsd,
    totalUsd:
      Math.round((uncachedInputUsd + cachedInputUsd + outputUsd) * 1e12) /
      1e12,
  };
}

export function estimateMuseCostUsd(input: MuseCostInput) {
  return estimateMuseCost(input).totalUsd;
}

export function estimateMuseUsageCost(usage: AgentUsage) {
  return estimateMuseCost({
    inputTokens: usage.inputTokens,
    cachedInputTokens: usage.cachedInputTokens,
    outputTokens: usage.outputTokens,
  });
}

export function reserveMuseRequestCost({
  inputTokens,
  maxOutputTokens = DEFAULT_MUSE_MAX_OUTPUT_TOKENS,
}: {
  inputTokens: number;
  maxOutputTokens?: number;
}) {
  return estimateMuseCost({
    inputTokens,
    // Reservations conservatively assume Meta will not serve a cache hit.
    cachedInputTokens: 0,
    outputTokens: maxOutputTokens,
  });
}

export function reserveMuseRequestCostUsd(input: {
  inputTokens: number;
  maxOutputTokens?: number;
}) {
  return reserveMuseRequestCost(input).totalUsd;
}
