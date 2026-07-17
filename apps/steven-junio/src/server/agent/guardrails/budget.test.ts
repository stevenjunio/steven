import assert from "node:assert/strict";
import test from "node:test";
import { estimateCostMicros, evaluateBudgetReservation, reconcileReservation, releaseReservation } from "./budget.ts";

const snapshot = { day: { limitMicros: 500_000, spentMicros: 100_000, reservedMicros: 50_000 }, month: { limitMicros: 5_000_000, spentMicros: 1_000_000, reservedMicros: 50_000 } };

test("reservation includes both spent and already reserved cost", () => {
  assert.equal(evaluateBudgetReservation(snapshot, 350_000).allowed, true);
  const blocked = evaluateBudgetReservation(snapshot, 350_001);
  assert.equal(blocked.allowed, false);
  if (!blocked.allowed) assert.deepEqual(blocked.blockedBy, ["day"]);
});

test("reconciliation frees the estimate and records actual cost", () => {
  const reserved = evaluateBudgetReservation(snapshot, 100_000);
  assert.equal(reserved.allowed, true);
  if (!reserved.allowed) return;
  const settled = reconcileReservation(reserved.projected, 100_000, 70_000);
  assert.equal(settled.next.day.reservedMicros, 50_000);
  assert.equal(settled.next.day.spentMicros, 170_000);
  assert.equal(settled.actualExceededReservation, false);
});

test("release returns reserved counters without adding spend", () => {
  const reserved = evaluateBudgetReservation(snapshot, 100_000);
  if (!reserved.allowed) return;
  assert.deepEqual(releaseReservation(reserved.projected, 100_000), snapshot);
});

test("Muse microdollar cost estimation rounds up", () => {
  assert.equal(estimateCostMicros({ inputTokens: 4_000, outputTokens: 1_200, inputDollarsPerMillionTokens: 1.25, outputDollarsPerMillionTokens: 4.25 }), 10_100);
});
