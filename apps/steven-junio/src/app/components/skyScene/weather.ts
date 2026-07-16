import type { CelestialBody } from "./celestialTime";

export type WeatherKind =
  | "clear"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

export type WeatherSnapshot = {
  condition: string;
  kind: WeatherKind;
  cloudCover: number;
  visibilityKm: number | null;
  windSpeedKph: number | null;
  observedAt: string | null;
  isFallback: boolean;
};

export type WeatherVisualState = {
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  cloudCount: number;
  cloudOpacity: number;
  cloudColor: string;
  cloudSpeed: number;
  skyTint: string;
};

type NwsValue<T> = {
  validTime: string;
  value: T;
};

type NwsCloudLayer = {
  amount?: string | null;
};

export type NwsObservation = {
  timestamp?: string | null;
  textDescription?: string | null;
  cloudLayers?: NwsCloudLayer[] | null;
  visibility?: { value?: number | null } | null;
  windSpeed?: { value?: number | null } | null;
  presentWeather?: Array<{ weather?: string | null }> | null;
};

export type NwsGridData = {
  skyCover?: { values?: Array<NwsValue<number | null>> };
  weather?: {
    values?: Array<
      NwsValue<
        Array<{
          weather?: string | null;
          intensity?: string | null;
        }> | null
      >
    >;
  };
};

const CLOUD_LAYER_COVER: Record<string, number> = {
  CLR: 0,
  SKC: 0,
  FEW: 20,
  SCT: 45,
  BKN: 75,
  OVC: 100,
  VV: 100,
};

export const FALLBACK_WEATHER: WeatherSnapshot = {
  condition: "Mostly clear",
  kind: "clear",
  cloudCover: 15,
  visibilityKm: 16,
  windSpeedKph: 0,
  observedAt: null,
  isFallback: true,
};

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

function parseDuration(duration: string) {
  const match =
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
      duration,
    );

  if (!match) return null;

  return (
    (Number(match[1] || 0) * 24 * 60 * 60 +
      Number(match[2] || 0) * 60 * 60 +
      Number(match[3] || 0) * 60 +
      Number(match[4] || 0)) *
    1000
  );
}

export function valueForTime<T>(
  values: Array<NwsValue<T>> | undefined,
  now: Date,
) {
  if (!values?.length) return null;

  for (const entry of values) {
    const [startText, durationText] = entry.validTime.split("/");
    const start = new Date(startText).getTime();
    const duration = durationText ? parseDuration(durationText) : null;

    if (
      Number.isFinite(start) &&
      duration !== null &&
      now.getTime() >= start &&
      now.getTime() < start + duration
    ) {
      return entry.value;
    }
  }

  return null;
}

function cloudCoverFromLayers(layers: NwsCloudLayer[] | null | undefined) {
  const values =
    layers
      ?.map((layer) =>
        layer.amount ? CLOUD_LAYER_COVER[layer.amount.toUpperCase()] : undefined,
      )
      .filter((value): value is number => value !== undefined) ?? [];

  return values.length ? Math.max(...values) : null;
}

function classifyWeather(
  description: string,
  cloudCover: number,
  visibilityKm: number | null,
): WeatherKind {
  const normalized = description.toLowerCase();

  if (/thunder|tornado|squall/.test(normalized)) return "storm";
  if (/snow|sleet|ice|freezing/.test(normalized)) return "snow";
  if (/rain|drizzle|shower/.test(normalized)) return "rain";
  if (
    /fog|mist|haze|smoke|dust/.test(normalized) ||
    (visibilityKm !== null && visibilityKm < 5)
  ) {
    return "fog";
  }
  if (/cloud|overcast/.test(normalized) || cloudCover >= 55) return "cloudy";

  return "clear";
}

function gridWeatherDescription(grid: NwsGridData, now: Date) {
  const weather = valueForTime(grid.weather?.values, now)?.find(
    (entry) => entry.weather,
  );

  if (!weather?.weather) return null;

  const intensity =
    weather.intensity && weather.intensity !== "none"
      ? `${weather.intensity} `
      : "";

  return `${intensity}${weather.weather}`.replaceAll("_", " ");
}

export function buildWeatherSnapshot(
  observation: NwsObservation | null,
  grid: NwsGridData | null,
  now = new Date(),
): WeatherSnapshot {
  const observedAt = observation?.timestamp
    ? new Date(observation.timestamp)
    : null;
  const observationIsFresh =
    observedAt !== null &&
    Number.isFinite(observedAt.getTime()) &&
    now.getTime() - observedAt.getTime() <= 2 * 60 * 60 * 1000;
  const observedCloudCover = observationIsFresh
    ? cloudCoverFromLayers(observation?.cloudLayers)
    : null;
  const forecastCloudCover = grid
    ? valueForTime(grid.skyCover?.values, now)
    : null;
  const cloudCover = clamp(
    observedCloudCover ?? forecastCloudCover ?? FALLBACK_WEATHER.cloudCover,
  );
  const visibilityKm =
    observationIsFresh && observation?.visibility?.value != null
      ? observation.visibility.value / 1000
      : null;
  const presentWeather =
    observationIsFresh
      ? observation?.presentWeather
          ?.map((entry) => entry.weather)
          .filter(Boolean)
          .join(", ")
      : null;
  const condition =
    presentWeather ||
    (observationIsFresh ? observation?.textDescription : null) ||
    (grid ? gridWeatherDescription(grid, now) : null) ||
    (cloudCover < 20
      ? "Clear"
      : cloudCover < 55
        ? "Partly cloudy"
        : "Cloudy");

  return {
    condition,
    kind: classifyWeather(condition, cloudCover, visibilityKm),
    cloudCover,
    visibilityKm,
    windSpeedKph:
      observationIsFresh && observation?.windSpeed?.value != null
        ? observation.windSpeed.value
        : null,
    observedAt: observationIsFresh ? observedAt.toISOString() : null,
    isFallback: !observationIsFresh && forecastCloudCover === null,
  };
}

export function getWeatherVisualState(
  weather: WeatherSnapshot,
  body: CelestialBody,
): WeatherVisualState {
  const cloudiness = clamp(weather.cloudCover) / 100;
  const lowVisibility =
    weather.visibilityKm === null
      ? 0
      : clamp((10 - weather.visibilityKm) / 10, 0, 1);
  const severeAtmosphere =
    weather.kind === "fog"
      ? 1
      : weather.kind === "rain" || weather.kind === "snow"
        ? 0.75
        : weather.kind === "storm"
          ? 1
          : 0;
  const atmosphere = Math.max(lowVisibility, severeAtmosphere);
  const isNight = body === "moon";

  return {
    turbidity: isNight
      ? 4 + atmosphere
      : 1.25 + cloudiness * 2.5 + atmosphere * 1.25,
    rayleigh: isNight
      ? 0.25
      : 2.45 - cloudiness * 1.15 - atmosphere * 0.35,
    mieCoefficient: isNight
      ? 0.004
      : 0.0015 + cloudiness * 0.0035 + atmosphere * 0.002,
    mieDirectionalG: 0.68 + cloudiness * 0.08 + atmosphere * 0.04,
    cloudCount: Math.round(4 + cloudiness * 52 + atmosphere * 10),
    cloudOpacity: 0.08 + cloudiness * 0.22 + atmosphere * 0.07,
    cloudColor:
      weather.kind === "storm"
        ? "#aeb8c2"
        : weather.kind === "rain" || weather.kind === "snow"
          ? "#c8d0d8"
          : "#f5f8fb",
    cloudSpeed: Math.min(
      0.2,
      0.025 + (weather.windSpeedKph ?? 0) / 300,
    ),
    skyTint: isNight
      ? "transparent"
      : `linear-gradient(to bottom, rgba(26, 115, 205, ${0.18 - cloudiness * 0.06}), rgba(73, 144, 209, ${0.24 - cloudiness * 0.08}))`,
  };
}
