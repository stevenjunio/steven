"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  formatPortfolioTime,
  PORTFOLIO_LOCATION,
  type CelestialState,
} from "./celestialTime";
import type { WeatherVisualState } from "./weather";

type CelestialControlProps = {
  celestial: CelestialState;
  visual: WeatherVisualState;
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
  visual,
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
      opacity: visual.celestialVisibility,
    };
  }, [celestial.arcProgress, visual.celestialVisibility]);

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
        data-celestial-body={celestial.body}
        data-sky-phase={celestial.phase}
        className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
        style={celestialStyle}
      >
        {isMoon ? (
          <div
            aria-hidden="true"
            className="sky-moon-orb relative size-20 rounded-full bg-[radial-gradient(circle_at_38%_34%,#fffef0_0%,#f2efcf_42%,#d3d2bd_76%,#aaa995_100%)] shadow-[0_0_34px_10px_rgba(203,213,225,0.4)] sm:size-24"
          >
            <span className="absolute left-[16%] top-[17%] size-[29%] rounded-full bg-[#c9c8b5]/65 shadow-[inset_2px_2px_4px_rgba(74,78,82,0.28)]" />
            <span className="absolute right-[17%] top-[31%] size-[17%] rounded-full bg-[#d1cfb7]/70 shadow-[inset_1px_1px_3px_rgba(74,78,82,0.22)]" />
            <span className="absolute bottom-[17%] left-[42%] size-[21%] rounded-full bg-[#c2c1ad]/70 shadow-[inset_2px_2px_3px_rgba(74,78,82,0.22)]" />
            <span className="absolute bottom-[28%] left-[19%] size-[10%] rounded-full bg-[#d7d4bd]/70" />
            <span className="absolute right-[25%] top-[15%] size-[8%] rounded-full bg-white/35" />
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_38%,rgba(30,41,59,0.15))]" />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="sky-sun-orb relative size-20 sm:size-24"
          >
            <span
              className="sky-sun-corona absolute -inset-[72%] rounded-full"
              style={{ opacity: 0.48 + visual.sunRayOpacity }}
            />
            <span
              className="sky-sun-spokes absolute -inset-[48%] rounded-full"
              style={{ opacity: 0.2 + visual.sunRayOpacity }}
            />
            <span className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle_at_38%_34%,#fffde0_0%,#fff87a_30%,#ffd83d_68%,#f8a91b_100%)] shadow-[0_0_35px_13px_rgba(253,224,71,0.66),0_0_90px_32px_rgba(251,191,36,0.2)]" />
            <span className="sky-sun-granulation absolute inset-[9%] rounded-full opacity-40 mix-blend-soft-light" />
            <span className="absolute left-[24%] top-[20%] size-[22%] rounded-full bg-white/45 blur-[2px]" />
          </div>
        )}
      </div>

      <div
        ref={labelRef}
        aria-label={`Steven's home time is ${formatPortfolioTime(currentTime, false, true)} in ${PORTFOLIO_LOCATION.city}.`}
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
      </div>
    </>
  );
}
