import assert from "node:assert/strict";
import test from "node:test";
import { attachRunCosts } from "./conversation.ts";

test("attaches completed run cost to the next assistant message", () => {
  const before = new Date("2026-07-18T00:00:00.000Z");
  const after = new Date("2026-07-18T00:00:01.000Z");
  const messages = [
    { id: "user", role: "USER", createdAt: before },
    { id: "assistant", role: "ASSISTANT", createdAt: after },
  ];
  const result = attachRunCosts(messages, [
    { status: "SUCCEEDED", createdAt: before, actualCostMicros: 1_234n },
  ]);

  assert.equal(result[1].costMicros, 1_234);
});

test("leaves memory confirmations without a model cost", () => {
  const memoryTime = new Date("2026-07-18T00:00:00.000Z");
  const runTime = new Date("2026-07-18T00:00:01.000Z");
  const answerTime = new Date("2026-07-18T00:00:02.000Z");
  const result = attachRunCosts(
    [
      { id: "memory", role: "ASSISTANT", createdAt: memoryTime },
      { id: "answer", role: "ASSISTANT", createdAt: answerTime },
    ],
    [{ status: "SUCCEEDED", createdAt: runTime, actualCostMicros: 500n }],
  );

  assert.equal(result[0].costMicros, undefined);
  assert.equal(result[1].costMicros, 500);
});
