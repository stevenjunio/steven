import { getPosition, getTimes } from "suncalc";
import { PORTFOLIO_LOCATION } from "./location.ts";

export { PORTFOLIO_LOCATION } from "./location.ts";

export type CelestialBody = "sun" | "moon";
export type SkyPhase = "night" | "dawn" | "golden-hour" | "day" | "dusk";

export type CelestialState = {
  body: CelestialBody;
  phase: SkyPhase;
  bodyPosition: [number, number, number];
  skySunPosition: [number, number, number];
  solarAltitude: number;
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
const SKY_SUN_DISTANCE = 100;

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

export function getSkySunPosition(date: Date): [number, number, number] {
  const { altitude, azimuth } = getPosition(
    date,
    PORTFOLIO_LOCATION.latitude,
    PORTFOLIO_LOCATION.longitude,
  );
  const altitudeRadians = (altitude * Math.PI) / 180;
  const azimuthRadians = (azimuth * Math.PI) / 180;
  const horizontalDistance =
    Math.cos(altitudeRadians) * SKY_SUN_DISTANCE;

  return [
    Math.sin(azimuthRadians) * horizontalDistance,
    Math.sin(altitudeRadians) * SKY_SUN_DISTANCE,
    -Math.cos(azimuthRadians) * horizontalDistance,
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
  const solarAltitude = getPosition(
    now,
    PORTFOLIO_LOCATION.latitude,
    PORTFOLIO_LOCATION.longitude,
  ).altitude;

  if (isDaylight) {
    const daylightProgress = progressBetween(now, today.sunrise, today.sunset);
    const position = getArcPosition(daylightProgress);
    const phase: SkyPhase = solarAltitude < 10 ? "golden-hour" : "day";

    return {
      body: "sun",
      phase,
      bodyPosition: position,
      skySunPosition: getSkySunPosition(now),
      solarAltitude,
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
  const phase: SkyPhase =
    solarAltitude >= -12
      ? now < today.sunrise
        ? "dawn"
        : "dusk"
      : "night";

  return {
    body: "moon",
    phase,
    bodyPosition: getArcPosition(nightProgress),
    skySunPosition: getSkySunPosition(now),
    solarAltitude,
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
