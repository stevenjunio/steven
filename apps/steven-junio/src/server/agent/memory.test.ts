import assert from "node:assert/strict";
import test from "node:test";
import { ownerMemoryScope, parseOwnerMemoryCommand } from "./memory.ts";

test("extracts direct remember commands as public memories", () => {
  assert.deepEqual(parseOwnerMemoryCommand("Remember that I prefer direct, practical answers."), {
    content: "I prefer direct, practical answers.",
    scope: "PUBLIC",
  });
  assert.deepEqual(parseOwnerMemoryCommand("Save I love aisle seats to my memory"), {
    content: "I love aisle seats",
    scope: "PUBLIC",
  });
  assert.deepEqual(parseOwnerMemoryCommand("Could you remember that I like small, focused interfaces?"), {
    content: "I like small, focused interfaces?",
    scope: "PUBLIC",
  });
});

test("recognizes explicit private memory language", () => {
  assert.equal(ownerMemoryScope("Remember this privately: my note"), "NEVER_PUBLISH");
  assert.deepEqual(parseOwnerMemoryCommand("Add to memory: private note, never publish"), {
    content: "private note, never publish",
    scope: "NEVER_PUBLISH",
  });
});

test("does not treat ordinary conversation as a memory write", () => {
  assert.equal(parseOwnerMemoryCommand("What do you remember about my projects?"), null);
  assert.equal(parseOwnerMemoryCommand("I remember when interfaces were simpler."), null);
});
