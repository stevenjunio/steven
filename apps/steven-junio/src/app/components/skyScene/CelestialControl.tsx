"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  formatPortfolioTime,
  PORTFOLIO_LOCATION,
  type CelestialState,
} from "./celestialTime";

type CelestialControlProps = {
  celestial: CelestialState;
};

export default function CelestialControl({ celestial }: CelestialControlProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [useCornerLabel, setUseCornerLabel] = useState(false);
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
  const labelAlignment =
    celestial.arcProgress > 0.72
      ? "right-0"
      : celestial.arcProgress < 0.28
        ? "left-0"
        : "left-1/2 -translate-x-1/2";

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

      let labelLeft = celestialRect.left;

      if (celestial.arcProgress > 0.72) {
        labelLeft = celestialRect.right - labelWidth;
      } else if (celestial.arcProgress >= 0.28) {
        labelLeft = celestialRect.left + (celestialRect.width - labelWidth) / 2;
      }

      const candidate = {
        left: labelLeft,
        right: labelLeft + labelWidth,
        top: celestialRect.bottom + 12,
        bottom: celestialRect.bottom + 12 + labelHeight,
      };
      const collisionPadding = 8;
      const overlapsHero =
        candidate.right > heroRect.left - collisionPadding &&
        candidate.left < heroRect.right + collisionPadding &&
        candidate.bottom > heroRect.top - collisionPadding &&
        candidate.top < heroRect.bottom + collisionPadding;
      const leavesViewport =
        candidate.left < 16 || candidate.right > window.innerWidth - 16;

      setUseCornerLabel(overlapsHero || leavesViewport);
    };

    updatePlacement();

    const resizeObserver = new ResizeObserver(updatePlacement);
    resizeObserver.observe(heroElement);
    resizeObserver.observe(labelElement);
    window.addEventListener("resize", updatePlacement);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePlacement);
    };
  }, [celestial.arcProgress, currentTime, useCornerLabel]);

  const cornerAlignment = celestial.arcProgress < 0.5 ? "left-4" : "right-4";
  const timeLabel = (
    <div
      ref={labelRef}
      role="status"
      aria-label={`Steven's home time is ${formatPortfolioTime(currentTime, false, true)} in ${PORTFOLIO_LOCATION.city}`}
      className={`pointer-events-none z-20 whitespace-nowrap rounded-full bg-slate-950/35 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/75 shadow-sm backdrop-blur-sm sm:text-xs ${
        useCornerLabel
          ? `fixed top-[calc(1rem+env(safe-area-inset-top))] ${cornerAlignment}`
          : `absolute top-[calc(100%+0.75rem)] ${labelAlignment}`
      }`}
    >
      {PORTFOLIO_LOCATION.city} · {formatPortfolioTime(currentTime, false, true)}
    </div>
  );

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

        {!useCornerLabel && timeLabel}
      </div>

      {useCornerLabel && timeLabel}
    </>
  );
}
