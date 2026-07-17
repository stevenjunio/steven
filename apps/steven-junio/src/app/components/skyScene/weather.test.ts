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
      windGust: { value: 18 },
      windDirection: { value: 450 },
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
  assert.equal(snapshot.windGustKph, 18);
  assert.equal(snapshot.windDirectionDeg, 90);
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

test("clear daylight remains blue and uses a small faint cloud budget", () => {
  const visual = getWeatherVisualState(
    {
      ...FALLBACK_WEATHER,
      condition: "Clear",
      cloudCover: 0,
      isFallback: false,
    },
    "day",
  );

  assert.ok(visual.rayleigh > 2);
  assert.ok(visual.mieCoefficient < 0.002);
  assert.ok(visual.cloudCount <= 10);
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
    "day",
  );

  assert.ok(visual.turbidity > 4);
  assert.ok(visual.mieCoefficient > 0.006);
  assert.ok(visual.cloudCount > 60);
  assert.notEqual(visual.skyTint, "transparent");
});

test("weather kinds select distinct atmospheric activity", () => {
  const clear = getWeatherVisualState(
    { ...FALLBACK_WEATHER, kind: "clear", cloudCover: 5 },
    "day",
  );
  const rain = getWeatherVisualState(
    {
      ...FALLBACK_WEATHER,
      condition: "Heavy rain",
      kind: "rain",
      cloudCover: 88,
    },
    "dusk",
  );
  const snow = getWeatherVisualState(
    {
      ...FALLBACK_WEATHER,
      condition: "Light snow",
      kind: "snow",
      cloudCover: 92,
    },
    "night",
  );
  const storm = getWeatherVisualState(
    {
      ...FALLBACK_WEATHER,
      condition: "Thunderstorms",
      kind: "storm",
      cloudCover: 100,
    },
    "day",
  );

  assert.equal(clear.precipitation, "none");
  assert.equal(rain.precipitation, "rain");
  assert.ok(rain.precipitationIntensity > 0.7);
  assert.equal(snow.precipitation, "snow");
  assert.ok(snow.precipitationIntensity < rain.precipitationIntensity);
  assert.equal(storm.lightningIntensity, 1);
  assert.ok(storm.cloudCount > clear.cloudCount);
});

test("visual scene values stay finite and inside renderer budgets", () => {
  const kinds = ["clear", "cloudy", "fog", "rain", "snow", "storm"] as const;
  const phases = ["night", "dawn", "golden-hour", "day", "dusk"] as const;

  for (const kind of kinds) {
    for (const phase of phases) {
      const visual = getWeatherVisualState(
        {
          ...FALLBACK_WEATHER,
          condition: kind,
          kind,
          cloudCover: 72,
          visibilityKm: kind === "fog" ? 1 : 12,
          windSpeedKph: 24,
          windGustKph: 42,
          windDirectionDeg: 315,
        },
        phase,
      );

      assert.ok(visual.cloudCount >= 4 && visual.cloudCount <= 128);
      assert.ok(visual.starCount >= 0 && visual.starCount <= 2200);
      assert.ok(visual.fogOpacity >= 0 && visual.fogOpacity <= 0.88);
      assert.ok(
        visual.precipitationIntensity >= 0 &&
          visual.precipitationIntensity <= 1,
      );
      assert.ok(Number.isFinite(visual.cloudDriftDirection));
      assert.ok(Number.isFinite(visual.cloudDriftSpeed));
    }
  }
});

test("rejects an observation timestamp too far in the future", () => {
  const snapshot = buildWeatherSnapshot(
    {
      timestamp: "2026-07-16T15:00:00+00:00",
      textDescription: "Rain",
      presentWeather: [{ weather: "rain", intensity: "heavy" }],
      cloudLayers: [{ amount: "OVC" }],
    },
    null,
    morning,
  );

  assert.equal(snapshot.kind, "clear");
  assert.equal(snapshot.observedAt, null);
  assert.equal(snapshot.isFallback, true);
});
