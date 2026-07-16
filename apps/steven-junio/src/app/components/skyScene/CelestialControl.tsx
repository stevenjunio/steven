"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  formatPortfolioTime,
  PORTFOLIO_LOCATION,
  type CelestialState,
} from "./celestialTime";
import type { WeatherSnapshot } from "./weather";

type CelestialControlProps = {
  celestial: CelestialState;
  weather: WeatherSnapshot;
};

type LabelPlacement =
  | {
      mode: "attached";
      left: number;
      top: number;
    }
  | {
      mode: "corner";
      side: "left" | "right";
    };

const VIEWPORT_MARGIN = 16;
const CELESTIAL_LABEL_OVERLAP = 16;

function placementsMatch(
  current: LabelPlacement | null,
  next: LabelPlacement,
) {
  if (!current || current.mode !== next.mode) return false;

  if (current.mode === "corner" && next.mode === "corner") {
    return current.side === next.side;
  }

  if (current.mode === "attached" && next.mode === "attached") {
    return current.left === next.left && current.top === next.top;
  }

  return false;
}

export default function CelestialControl({
  celestial,
  weather,
}: CelestialControlProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [labelPlacement, setLabelPlacement] =
    useState<LabelPlacement | null>(null);
  const celestialRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const celestialStyle = useMemo(() => {
    const arcHeight = Math.sin(Math.PI * celestial.arcProgress);

    return {
      left: `${8 + celestial.arcProgress * 84}%`,
      top: `${68 - arcHeight * 44}%`,
    };
  }, [celestial.arcProgress]);

  const isMoon = celestial.body === "moon";

  useLayoutEffect(() => {
    const celestialElement = celestialRef.current;
    const labelElement = labelRef.current;
    const heroElement = document.querySelector<HTMLElement>(
      "[data-portfolio-hero]",
    );

    if (!celestialElement || !labelElement || !heroElement) return;

    const updatePlacement = () => {
      const celestialRect = celestialElement.getBoundingClientRect();
      const labelRect = labelElement.getBoundingClientRect();
      const heroRect = heroElement.getBoundingClientRect();
      const labelWidth = labelRect.width;
      const labelHeight = labelRect.height;

      const idealLeft =
        celestialRect.left + (celestialRect.width - labelWidth) / 2;
      const maximumLeft = Math.max(
        VIEWPORT_MARGIN,
        window.innerWidth - labelWidth - VIEWPORT_MARGIN,
      );
      const labelLeft = Math.min(
        maximumLeft,
        Math.max(VIEWPORT_MARGIN, idealLeft),
      );
      const labelTop =
        celestialRect.top - labelHeight + CELESTIAL_LABEL_OVERLAP;

      const candidate = {
        left: labelLeft,
        right: labelLeft + labelWidth,
        top: labelTop,
        bottom: labelTop + labelHeight,
      };
      const overlapsHero =
        candidate.right > heroRect.left &&
        candidate.left < heroRect.right &&
        candidate.bottom > heroRect.top &&
        candidate.top < heroRect.bottom;
      const lacksVerticalRoom = candidate.top < VIEWPORT_MARGIN;

      const nextPlacement: LabelPlacement =
        overlapsHero || lacksVerticalRoom
          ? {
              mode: "corner",
              side: celestialRect.left < window.innerWidth / 2 ? "left" : "right",
            }
          : {
              mode: "attached",
              left: Math.round(labelLeft),
              top: Math.round(labelTop),
            };

      setLabelPlacement((current) =>
        placementsMatch(current, nextPlacement) ? current : nextPlacement,
      );
    };

    updatePlacement();

    const resizeObserver = new ResizeObserver(updatePlacement);
    resizeObserver.observe(celestialElement);
    resizeObserver.observe(heroElement);
    resizeObserver.observe(labelElement);
    window.addEventListener("resize", updatePlacement);
    window.visualViewport?.addEventListener("resize", updatePlacement);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePlacement);
      window.visualViewport?.removeEventListener("resize", updatePlacement);
    };
  }, [celestial.arcProgress, currentTime]);

  const isCornerLabel = labelPlacement?.mode === "corner";
  const cornerAlignment =
    isCornerLabel && labelPlacement.side === "right" ? "right-4" : "left-4";
  const attachedStyle =
    labelPlacement?.mode === "attached"
      ? {
          left: labelPlacement.left,
          top: labelPlacement.top,
        }
      : undefined;

  return (
    <>
      <div
        ref={celestialRef}
        className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2"
        style={celestialStyle}
      >
        <div
          aria-hidden="true"
          className={`relative size-20 rounded-full sm:size-24 ${
            isMoon
              ? "bg-[#f4f1d0] shadow-[0_0_24px_8px_rgba(226,232,240,0.45)]"
              : "bg-[#fff96b] shadow-[0_0_32px_12px_rgba(253,224,71,0.65)]"
          }`}
        >
          {isMoon && (
            <>
              <span className="absolute left-[22%] top-[24%] size-[20%] rounded-full bg-[#c9c8b5]" />
              <span className="absolute right-[20%] top-[38%] size-[14%] rounded-full bg-[#d5d3ba]" />
              <span className="absolute bottom-[20%] left-[46%] size-[17%] rounded-full bg-[#c5c4b0]" />
            </>
          )}
        </div>
      </div>

      <div
        ref={labelRef}
        role="status"
        aria-label={`Steven's home time is ${formatPortfolioTime(currentTime, false, true)} in ${PORTFOLIO_LOCATION.city}. Current conditions: ${weather.condition}.`}
        style={attachedStyle}
        className={`pointer-events-none fixed z-20 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/80 shadow-sm backdrop-blur-md transition-opacity sm:text-xs ${
          labelPlacement
            ? "opacity-100"
            : "left-0 top-0 opacity-0"
        } ${
          isCornerLabel
            ? `top-[calc(1rem+env(safe-area-inset-top))] ${cornerAlignment}`
            : ""
        }`}
      >
        {PORTFOLIO_LOCATION.city} ·{" "}
        <span className="tabular-nums">
          {formatPortfolioTime(currentTime, false, true)}
        </span>
        {!weather.isFallback && (
          <span className="hidden sm:inline"> · {weather.condition}</span>
        )}
      </div>
    </>
  );
}
