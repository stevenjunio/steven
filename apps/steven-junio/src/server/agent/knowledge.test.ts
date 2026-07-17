import assert from "node:assert/strict";
import test from "node:test";
import { chunkKnowledge } from "./chunking.ts";
import { rankRetrievedKnowledge } from "./ranking.ts";

test("knowledge chunking preserves content while bounding normal chunks", () => {
  const chunks = chunkKnowledge(["First paragraph.", "Second paragraph is useful context.", "x".repeat(2_000)].join("\n\n"), 500);
  assert.ok(chunks.length >= 5);
  assert.ok(chunks.every((chunk) => chunk.length <= 500));
  assert.match(chunks.join(" "), /First paragraph/);
  assert.match(chunks.join(" "), /Second paragraph/);
});

test("approved memories compete with knowledge chunks by relevance", () => {
  const ranked = rankRetrievedKnowledge([
    { id: "chunk", sourceName: "Portfolio", sourceUrl: null, content: "Tabiya", score: 2 },
    { id: "memory:1", sourceName: "Approved memory", sourceUrl: null, content: "Steven prefers aisle seats", score: 4 },
    { id: "irrelevant", sourceName: "Portfolio", sourceUrl: null, content: "Other", score: 0 },
  ], 2);

  assert.deepEqual(ranked.map((item) => item.id), ["memory:1", "chunk"]);
});
