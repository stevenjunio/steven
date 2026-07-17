import assert from "node:assert/strict";
import test from "node:test";
import { chunkKnowledge } from "./chunking.ts";

test("knowledge chunking preserves content while bounding normal chunks", () => {
  const chunks = chunkKnowledge(["First paragraph.", "Second paragraph is useful context.", "x".repeat(2_000)].join("\n\n"), 500);
  assert.ok(chunks.length >= 5);
  assert.ok(chunks.every((chunk) => chunk.length <= 500));
  assert.match(chunks.join(" "), /First paragraph/);
  assert.match(chunks.join(" "), /Second paragraph/);
});
