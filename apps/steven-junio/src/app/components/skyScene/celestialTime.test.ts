import assert from "node:assert/strict";
import test from "node:test";
import { getCelestialState, getSkySunPosition } from "./celestialTime.ts";

test("morning sky uses the real above-horizon sun position", () => {
  const morning = new Date("2026-07-16T07:36:00-07:00");
  const state = getCelestialState(morning);

  assert.equal(state.body, "sun");
  assert.equal(state.phase, "day");
  assert.ok(
    state.bodyPosition[1] < 0,
    "the decorative arc should preserve its existing visual placement",
  );
  assert.ok(
    state.skySunPosition[1] > 25,
    "the sky shader sun should be well above the horizon",
  );
});

test("moves through dawn, golden hour, day, dusk, and night", () => {
  const states = [
    ["2026-07-16T05:30:00-07:00", "dawn"],
    ["2026-07-16T06:30:00-07:00", "golden-hour"],
    ["2026-07-16T13:00:00-07:00", "day"],
    ["2026-07-16T20:30:00-07:00", "dusk"],
    ["2026-07-16T23:30:00-07:00", "night"],
  ] as const;

  for (const [time, expectedPhase] of states) {
    assert.equal(getCelestialState(new Date(time)).phase, expectedPhase);
  }
});

test("real sky sun position crosses the horizon around sunrise and sunset", () => {
  const beforeSunrise = getSkySunPosition(
    new Date("2026-07-16T05:30:00-07:00"),
  );
  const afterSunrise = getSkySunPosition(
    new Date("2026-07-16T06:30:00-07:00"),
  );
  const beforeSunset = getSkySunPosition(
    new Date("2026-07-16T20:00:00-07:00"),
  );
  const afterSunset = getSkySunPosition(
    new Date("2026-07-16T21:00:00-07:00"),
  );

  assert.ok(beforeSunrise[1] < 0);
  assert.ok(afterSunrise[1] > 0);
  assert.ok(beforeSunset[1] > 0);
  assert.ok(afterSunset[1] < 0);
});

test("sky sun vector stays on the shader's celestial sphere", () => {
  const position = getSkySunPosition(
    new Date("2026-07-16T13:13:00-07:00"),
  );
  const distance = Math.hypot(...position);

  assert.ok(Math.abs(distance - 100) < 0.000_001);
});
