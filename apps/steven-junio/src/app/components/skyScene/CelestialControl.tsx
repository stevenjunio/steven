"use client";

import { useEffect, useMemo, useState } from "react";
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

  const labelAlignment =
    celestial.arcProgress > 0.72
      ? "right-0"
      : celestial.arcProgress < 0.28
        ? "left-0"
        : "left-1/2 -translate-x-1/2";
  const isMoon = celestial.body === "moon";

  return (
    <div
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

      <div
        role="status"
        aria-label={`Steven's home time is ${formatPortfolioTime(currentTime, false, true)} in ${PORTFOLIO_LOCATION.city}`}
        className={`absolute top-[calc(100%+0.75rem)] whitespace-nowrap rounded-full bg-slate-950/35 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/75 shadow-sm backdrop-blur-sm sm:text-xs ${labelAlignment}`}
      >
        {PORTFOLIO_LOCATION.city} · {formatPortfolioTime(currentTime, false, true)}
      </div>
    </div>
  );
}
