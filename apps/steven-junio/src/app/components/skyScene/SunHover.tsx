"use client";

import { useState, useEffect } from "react";
import {
  formatPortfolioTime,
  PORTFOLIO_LOCATION,
  type CelestialBody,
} from "./celestialTime";

type SunHoverProps = {
  body: CelestialBody;
  nextTransition: Date;
  nextTransitionLabel: "Sunrise" | "Sunset";
};

export default function SunHover({
  body,
  nextTransition,
  nextTransitionLabel,
}: SunHoverProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none min-w-52 -translate-y-2 rounded-xl border border-white/40 bg-slate-950/85 px-4 py-3 text-center text-white shadow-2xl backdrop-blur-md">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
        Steven&apos;s local time
      </div>
      <div className="mt-1 whitespace-nowrap text-2xl font-semibold tabular-nums">
        {formatPortfolioTime(currentTime, true)}
      </div>
      <div className="mt-1 text-sm text-slate-200">
        {PORTFOLIO_LOCATION.city} · {body === "sun" ? "Daylight" : "Nighttime"}
      </div>
      <div className="mt-2 border-t border-white/15 pt-2 text-xs text-slate-300">
        {nextTransitionLabel} · {formatPortfolioTime(nextTransition)}
      </div>
    </div>
  );
}
