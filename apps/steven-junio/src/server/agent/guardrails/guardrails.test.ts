import assert from "node:assert/strict";
import test from "node:test";
import { decideKnowledgeAccess } from "./policy.ts";
import { validatePublicAgentMessage } from "./input.ts";
import { deriveVisitorIdentifiers, redactNetworkIdentifiers } from "./visitor.ts";

test("public retrieval fails closed for private, draft, and blocked records", () => {
  assert.equal(decideKnowledgeAccess({ classification: "public", modelAccess: "allowed", status: "approved" }, { scope: "public", isOwner: false }).allowed, true);
  assert.equal(decideKnowledgeAccess({ classification: "private", modelAccess: "allowed", status: "approved" }, { scope: "public", isOwner: false }).allowed, false);
  assert.equal(decideKnowledgeAccess({ classification: "public", modelAccess: "allowed", status: "draft" }, { scope: "public", isOwner: false }).allowed, false);
  assert.equal(decideKnowledgeAccess({ classification: "public", modelAccess: "blocked", status: "approved" }, { scope: "public", isOwner: false }).allowed, false);
});

test("private retrieval requires the owner", () => {
  const record = { classification: "never_publish" as const, modelAccess: "allowed" as const, status: "approved" as const };
  assert.equal(decideKnowledgeAccess(record, { scope: "private", isOwner: false }).allowed, false);
  assert.equal(decideKnowledgeAccess(record, { scope: "private", isOwner: true }).allowed, true);
});

test("public input counts unicode code points and rejects unsafe controls", () => {
  assert.equal(validatePublicAgentMessage("   ").ok, false);
  assert.equal(validatePublicAgentMessage("hello\u0000there").ok, false);
  assert.equal(validatePublicAgentMessage("😀".repeat(1_500)).ok, true);
  assert.equal(validatePublicAgentMessage("😀".repeat(1_501)).ok, false);
});

test("visitor identities rotate and never expose raw identifiers", () => {
  const input = { sessionId: "secret-session", rawIp: "203.0.113.5", secret: "x".repeat(32), now: new Date("2026-07-17T01:00:00Z") };
  const first = deriveVisitorIdentifiers(input);
  const second = deriveVisitorIdentifiers(input);
  const tomorrow = deriveVisitorIdentifiers({ ...input, now: new Date("2026-07-18T01:00:00Z") });
  assert.deepEqual(first, second);
  assert.notEqual(first.networkKey, tomorrow.networkKey);
  assert.ok(!JSON.stringify(first).includes(input.rawIp));
  assert.match(redactNetworkIdentifiers("mail me at a@example.com from 203.0.113.5"), /REDACTED/);
});
