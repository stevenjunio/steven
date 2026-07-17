import assert from "node:assert/strict";
import test from "node:test";
import {
  estimateMuseCost,
  estimateMuseUsageCost,
  reserveMuseRequestCostUsd,
} from "./cost.ts";

test("estimates uncached, cached, and output token cost independently", () => {
  const cost = estimateMuseCost({
    inputTokens: 4_000,
    cachedInputTokens: 2_000,
    outputTokens: 600,
  });

  assert.deepEqual(cost, {
    uncachedInputTokens: 2_000,
    cachedInputTokens: 2_000,
    outputTokens: 600,
    uncachedInputUsd: 0.0025,
    cachedInputUsd: 0.0003,
    outputUsd: 0.00255,
    totalUsd: 0.00535,
  });
});

test("does not double-charge reasoning tokens included in output tokens", () => {
  const cost = estimateMuseUsageCost({
    inputTokens: 4_000,
    cachedInputTokens: 2_000,
    outputTokens: 1_500,
    reasoningTokens: 1_200,
    totalTokens: 5_500,
  });

  assert.equal(cost.outputTokens, 1_500);
  assert.equal(cost.totalUsd, 0.009175);
});

test("reserves against uncached input and the full output ceiling", () => {
  assert.equal(
    reserveMuseRequestCostUsd({ inputTokens: 4_000 }),
    0.0101,
  );
});

test("rejects impossible token counts", () => {
  assert.throws(
    () =>
      estimateMuseCost({
        inputTokens: 10,
        cachedInputTokens: 11,
        outputTokens: 1,
      }),
    /cannot exceed/,
  );
  assert.throws(
    () =>
      estimateMuseCost({
        inputTokens: -1,
        outputTokens: 1,
      }),
    /non-negative/,
  );
});
