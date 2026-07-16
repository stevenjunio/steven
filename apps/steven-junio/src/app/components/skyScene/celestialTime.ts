import { getTimes } from "suncalc";

export const PORTFOLIO_LOCATION = {
  city: "San Jose, CA",
  latitude: 37.3382,
  longitude: -121.8863,
  timeZone: "America/Los_Angeles",
} as const;

export type CelestialBody = "sun" | "moon";

export type CelestialState = {
  body: CelestialBody;
  bodyPosition: [number, number, number];
  skySunPosition: [number, number, number];
  sunrise: Date;
  sunset: Date;
  nextTransition: Date;
  nextTransitionLabel: "Sunrise" | "Sunset";
  arcProgress: number;
  nightProgress: number;
};

const ARC_WIDTH = 36;
const HORIZON_HEIGHT = -8;
const ARC_HEIGHT = 19;
const SCENE_DEPTH = -20;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getLocalDateAnchor(date: Date, dayOffset = 0) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PORTFOLIO_LOCATION.timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((candidate) => candidate.type === type)?.value);

  return new Date(
    Date.UTC(part("year"), part("month") - 1, part("day") + dayOffset, 12),
  );
}

function getSolarTimes(date: Date, dayOffset = 0) {
  const times = getTimes(
    getLocalDateAnchor(date, dayOffset),
    PORTFOLIO_LOCATION.latitude,
    PORTFOLIO_LOCATION.longitude,
  );

  if (!times.sunrise || !times.sunset) {
    throw new Error("Sunrise and sunset are unavailable for San Jose.");
  }

  return { sunrise: times.sunrise, sunset: times.sunset };
}

function getArcPosition(progress: number): [number, number, number] {
  const angle = Math.PI * clamp(progress);

  return [
    -ARC_WIDTH / 2 + ARC_WIDTH * clamp(progress),
    HORIZON_HEIGHT + Math.sin(angle) * ARC_HEIGHT,
    SCENE_DEPTH,
  ];
}

function getBelowHorizonSunPosition(progress: number): [number, number, number] {
  const normalizedProgress = clamp(progress);
  const angle = Math.PI * normalizedProgress;

  return [
    ARC_WIDTH / 2 - ARC_WIDTH * normalizedProgress,
    -HORIZON_HEIGHT - Math.sin(angle) * ARC_HEIGHT,
    SCENE_DEPTH,
  ];
}

function progressBetween(now: Date, start: Date, end: Date) {
  return clamp((now.getTime() - start.getTime()) / (end.getTime() - start.getTime()));
}

export function getCelestialState(now = new Date()): CelestialState {
  const yesterday = getSolarTimes(now, -1);
  const today = getSolarTimes(now);
  const tomorrow = getSolarTimes(now, 1);
  const isDaylight = now >= today.sunrise && now < today.sunset;

  if (isDaylight) {
    const daylightProgress = progressBetween(now, today.sunrise, today.sunset);
    const position = getArcPosition(daylightProgress);

    return {
      body: "sun",
      bodyPosition: position,
      skySunPosition: position,
      sunrise: today.sunrise,
      sunset: today.sunset,
      nextTransition: today.sunset,
      nextTransitionLabel: "Sunset",
      arcProgress: daylightProgress,
      nightProgress: 0,
    };
  }

  const nightStarted = now < today.sunrise ? yesterday.sunset : today.sunset;
  const nightEnds = now < today.sunrise ? today.sunrise : tomorrow.sunrise;
  const nightProgress = progressBetween(now, nightStarted, nightEnds);

  return {
    body: "moon",
    bodyPosition: getArcPosition(nightProgress),
    skySunPosition: getBelowHorizonSunPosition(nightProgress),
    sunrise: now < today.sunrise ? today.sunrise : tomorrow.sunrise,
    sunset: today.sunset,
    nextTransition: nightEnds,
    nextTransitionLabel: "Sunrise",
    arcProgress: nightProgress,
    nightProgress,
  };
}

export function formatPortfolioTime(
  date: Date,
  includeSeconds = false,
  includeTimeZone = includeSeconds,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PORTFOLIO_LOCATION.timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    timeZoneName: includeTimeZone ? "short" : undefined,
  }).format(date);
}
