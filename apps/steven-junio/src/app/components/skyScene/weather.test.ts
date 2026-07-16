import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWeatherSnapshot,
  FALLBACK_WEATHER,
  getWeatherVisualState,
  valueForTime,
} from "./weather.ts";

const morning = new Date("2026-07-16T07:45:00-07:00");

test("selects the NWS value whose validity interval contains the current time", () => {
  const value = valueForTime(
    [
      {
        validTime: "2026-07-16T13:00:00+00:00/PT1H",
        value: 12,
      },
      {
        validTime: "2026-07-16T14:00:00+00:00/PT3H",
        value: 28,
      },
    ],
    morning,
  );

  assert.equal(value, 28);
});

test("prefers a fresh clear observation over forecast cloud cover", () => {
  const snapshot = buildWeatherSnapshot(
    {
      timestamp: "2026-07-16T14:25:00+00:00",
      textDescription: "Clear",
      cloudLayers: [{ amount: "CLR" }],
      visibility: { value: 16_093.44 },
      windSpeed: { value: 0 },
      presentWeather: [],
    },
    {
      skyCover: {
        values: [
          {
            validTime: "2026-07-16T14:00:00+00:00/PT3H",
            value: 40,
          },
        ],
      },
    },
    morning,
  );

  assert.equal(snapshot.condition, "Clear");
  assert.equal(snapshot.kind, "clear");
  assert.equal(snapshot.cloudCover, 0);
  assert.equal(snapshot.visibilityKm, 16.09344);
  assert.equal(snapshot.isFallback, false);
});

test("uses forecast sky cover when the observation is stale", () => {
  const snapshot = buildWeatherSnapshot(
    {
      timestamp: "2026-07-16T10:00:00+00:00",
      textDescription: "Clear",
      cloudLayers: [{ amount: "CLR" }],
    },
    {
      skyCover: {
        values: [
          {
            validTime: "2026-07-16T14:00:00+00:00/PT3H",
            value: 82,
          },
        ],
      },
    },
    morning,
  );

  assert.equal(snapshot.cloudCover, 82);
  assert.equal(snapshot.kind, "cloudy");
  assert.equal(snapshot.isFallback, false);
});

test("clear daylight remains blue and uses only a few faint clouds", () => {
  const visual = getWeatherVisualState(
    {
      ...FALLBACK_WEATHER,
      condition: "Clear",
      cloudCover: 0,
      isFallback: false,
    },
    "sun",
  );

  assert.ok(visual.rayleigh > 2);
  assert.ok(visual.mieCoefficient < 0.002);
  assert.ok(visual.cloudCount <= 5);
  assert.match(visual.skyTint, /rgba\(26, 115, 205/);
});

test("fog increases haze and cloud presence without removing the blue tint", () => {
  const visual = getWeatherVisualState(
    {
      ...FALLBACK_WEATHER,
      condition: "Fog",
      kind: "fog",
      cloudCover: 100,
      visibilityKm: 1,
      isFallback: false,
    },
    "sun",
  );

  assert.ok(visual.turbidity > 4);
  assert.ok(visual.mieCoefficient > 0.006);
  assert.ok(visual.cloudCount > 60);
  assert.notEqual(visual.skyTint, "transparent");
});
