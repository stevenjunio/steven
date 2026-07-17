import type { SkyPhase } from "./celestialTime";

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
  windGustKph: number | null;
  windDirectionDeg: number | null;
  observedAt: string | null;
  isFallback: boolean;
};

export type PrecipitationKind = "none" | "rain" | "snow";

export type WeatherVisualState = {
  kind: WeatherKind;
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  cloudCount: number;
  cloudOpacity: number;
  cloudColor: string;
  cloudShadowColor: string;
  cloudSpeed: number;
  cloudDriftSpeed: number;
  cloudDriftDirection: number;
  ambientLight: number;
  precipitation: PrecipitationKind;
  precipitationIntensity: number;
  precipitationColor: string;
  fogOpacity: number;
  lightningIntensity: number;
  starCount: number;
  celestialVisibility: number;
  sunRayOpacity: number;
  skyTint: string;
  horizonGlow: string;
  vignette: string;
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
  windGust?: { value?: number | null } | null;
  windDirection?: { value?: number | null } | null;
  presentWeather?: Array<{
    weather?: string | null;
    intensity?: string | null;
  }> | null;
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
  windGustKph: 0,
  windDirectionDeg: 270,
  observedAt: null,
  isFallback: true,
};

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

const PHASE_PALETTE: Record<
  SkyPhase,
  {
    tint: string;
    horizon: string;
    vignette: string;
    stars: number;
    ambientLight: number;
    sunRays: number;
  }
> = {
  night: {
    tint:
      "linear-gradient(to bottom, rgba(2, 6, 23, 0.54), rgba(14, 24, 48, 0.32) 58%, rgba(45, 44, 65, 0.24))",
    horizon:
      "radial-gradient(ellipse at 50% 108%, rgba(122, 116, 155, 0.28), rgba(23, 30, 52, 0.08) 45%, transparent 72%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 45%, rgba(2, 6, 23, 0.38) 100%)",
    stars: 1,
    ambientLight: 0.58,
    sunRays: 0,
  },
  dawn: {
    tint:
      "linear-gradient(to bottom, rgba(18, 45, 91, 0.34), rgba(118, 115, 151, 0.18) 55%, rgba(244, 150, 106, 0.22))",
    horizon:
      "radial-gradient(ellipse at 24% 105%, rgba(255, 166, 111, 0.58), rgba(250, 196, 154, 0.16) 38%, transparent 68%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 54%, rgba(27, 33, 58, 0.22) 100%)",
    stars: 0.3,
    ambientLight: 0.88,
    sunRays: 0.15,
  },
  "golden-hour": {
    tint:
      "linear-gradient(to bottom, rgba(38, 108, 187, 0.25), rgba(111, 165, 205, 0.12) 44%, rgba(248, 177, 111, 0.18) 70%, rgba(255, 137, 72, 0.26))",
    horizon:
      "radial-gradient(ellipse at 50% 108%, rgba(255, 183, 102, 0.52), rgba(255, 220, 174, 0.12) 42%, transparent 70%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 58%, rgba(84, 44, 31, 0.16) 100%)",
    stars: 0,
    ambientLight: 1.2,
    sunRays: 0.34,
  },
  day: {
    tint:
      "linear-gradient(to bottom, rgba(26, 115, 205, 0.18), rgba(73, 144, 209, 0.24))",
    horizon:
      "radial-gradient(ellipse at 50% 112%, rgba(224, 243, 255, 0.42), rgba(176, 217, 245, 0.08) 48%, transparent 72%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 62%, rgba(34, 91, 139, 0.12) 100%)",
    stars: 0,
    ambientLight: 1.7,
    sunRays: 0.2,
  },
  dusk: {
    tint:
      "linear-gradient(to bottom, rgba(15, 39, 81, 0.38), rgba(102, 78, 121, 0.2) 56%, rgba(232, 107, 91, 0.2))",
    horizon:
      "radial-gradient(ellipse at 76% 106%, rgba(255, 128, 91, 0.52), rgba(202, 121, 133, 0.14) 40%, transparent 68%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 50%, rgba(21, 24, 49, 0.3) 100%)",
    stars: 0.38,
    ambientLight: 0.76,
    sunRays: 0.08,
  },
};

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
  const observationAge = observedAt
    ? now.getTime() - observedAt.getTime()
    : Number.NaN;
  const observationIsFresh =
    observedAt !== null &&
    Number.isFinite(observedAt.getTime()) &&
    observationAge >= -10 * 60 * 1000 &&
    observationAge <= 2 * 60 * 60 * 1000;
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
          ?.map((entry) => {
            if (!entry.weather) return null;

            const intensity =
              entry.intensity && entry.intensity !== "none"
                ? `${entry.intensity} `
                : "";

            return `${intensity}${entry.weather}`.replaceAll("_", " ");
          })
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
    windGustKph:
      observationIsFresh && observation?.windGust?.value != null
        ? observation.windGust.value
        : null,
    windDirectionDeg:
      observationIsFresh && observation?.windDirection?.value != null
        ? ((observation.windDirection.value % 360) + 360) % 360
        : null,
    observedAt: observationIsFresh ? observedAt.toISOString() : null,
    isFallback: !observationIsFresh && forecastCloudCover === null,
  };
}

export function getWeatherVisualState(
  weather: WeatherSnapshot,
  phase: SkyPhase,
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
  const palette = PHASE_PALETTE[phase];
  const isNight = phase === "night";
  const precipitation: PrecipitationKind =
    weather.kind === "snow"
      ? "snow"
      : weather.kind === "rain" || weather.kind === "storm"
        ? "rain"
        : "none";
  const normalizedCondition = weather.condition.toLowerCase();
  const precipitationBase =
    weather.kind === "storm"
      ? 0.92
      : weather.kind === "rain"
        ? 0.58
        : weather.kind === "snow"
          ? 0.48
          : 0;
  const precipitationIntensity = clamp(
    precipitationBase +
      (/heavy|torrential/.test(normalizedCondition) ? 0.18 : 0) -
      (/light|drizzle|flurr/.test(normalizedCondition) ? 0.18 : 0),
    0,
    1,
  );
  const windStrength = Math.max(
    weather.windSpeedKph ?? 0,
    (weather.windGustKph ?? 0) * 0.72,
  );
  const windRadians =
    ((weather.windDirectionDeg ?? 270) * Math.PI) / 180;
  const horizontalWind = -Math.sin(windRadians);
  const cloudDriftDirection =
    Math.abs(horizontalWind) < 0.2
      ? horizontalWind < 0
        ? -0.2
        : 0.2
      : horizontalWind;
  const stormShade =
    weather.kind === "storm"
      ? "linear-gradient(to bottom, rgba(22, 31, 45, 0.48), rgba(42, 53, 68, 0.52))"
      : weather.kind === "rain"
        ? "linear-gradient(to bottom, rgba(42, 55, 72, 0.32), rgba(66, 81, 98, 0.38))"
        : weather.kind === "snow"
          ? "linear-gradient(to bottom, rgba(226, 232, 240, 0.12), rgba(203, 213, 225, 0.22))"
          : weather.kind === "fog"
            ? "linear-gradient(to bottom, rgba(203, 213, 225, 0.2), rgba(226, 232, 240, 0.3))"
            : "linear-gradient(transparent, transparent)";
  const cloudColor = isNight
    ? weather.kind === "storm"
      ? "#4d5869"
      : "#9eabbc"
    : weather.kind === "storm"
      ? "#778493"
      : weather.kind === "rain"
        ? "#aeb9c4"
        : weather.kind === "snow"
          ? "#e2e8ee"
          : weather.kind === "fog"
            ? "#d5dde3"
            : phase === "golden-hour"
              ? "#fff0d7"
              : "#f7fafc";

  return {
    kind: weather.kind,
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
    cloudCount: Math.round(8 + cloudiness * 82 + atmosphere * 24),
    cloudOpacity: 0.12 + cloudiness * 0.3 + atmosphere * 0.1,
    cloudColor,
    cloudShadowColor: isNight
      ? "#3b4658"
      : weather.kind === "storm"
        ? "#596573"
        : weather.kind === "rain"
          ? "#98a6b3"
          : "#c7d2dc",
    cloudSpeed: Math.min(
      0.24,
      0.025 + windStrength / 280,
    ),
    cloudDriftSpeed: Math.min(0.82, 0.08 + windStrength / 52),
    cloudDriftDirection,
    ambientLight: Math.max(
      0.45,
      palette.ambientLight - cloudiness * 0.32 - atmosphere * 0.18,
    ),
    precipitation,
    precipitationIntensity,
    precipitationColor:
      precipitation === "snow"
        ? isNight
          ? "#dbeafe"
          : "#ffffff"
        : isNight
          ? "#7dd3fc"
          : "#d8f0ff",
    fogOpacity: clamp(
      Math.max(
        lowVisibility * 0.84,
        weather.kind === "fog" ? 0.72 : 0,
        precipitation !== "none" ? 0.2 + precipitationIntensity * 0.18 : 0,
      ),
      0,
      0.88,
    ),
    lightningIntensity: weather.kind === "storm" ? 1 : 0,
    starCount: Math.round(
      2200 *
        palette.stars *
        (1 - cloudiness * 0.74) *
        (1 - atmosphere * 0.82),
    ),
    celestialVisibility: clamp(
      1 - cloudiness * 0.34 - atmosphere * 0.38,
      0.28,
      1,
    ),
    sunRayOpacity:
      palette.sunRays * (1 - cloudiness * 0.78) * (1 - atmosphere * 0.8),
    skyTint: `${stormShade}, ${palette.tint}`,
    horizonGlow: palette.horizon,
    vignette: palette.vignette,
  };
}
