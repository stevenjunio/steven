"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SunHover from "./SunHover";
import type { CelestialState } from "./celestialTime";

type CelestialControlProps = {
  celestial: CelestialState;
};

export default function CelestialControl({ celestial }: CelestialControlProps) {
  const [timeVisible, setTimeVisible] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    },
    [],
  );

  const handleTap = useCallback(() => {
    setTimeVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setTimeVisible(false);
      hideTimer.current = undefined;
    }, 5000);
  }, []);

  const dismissHover = useCallback(() => {
    if (!hideTimer.current) setTimeVisible(false);
  }, []);

  const celestialStyle = useMemo(() => {
    const arcHeight = Math.sin(Math.PI * celestial.arcProgress);

    return {
      left: `${8 + celestial.arcProgress * 84}%`,
      top: `${68 - arcHeight * 44}%`,
    };
  }, [celestial.arcProgress]);

  const tooltipAlignment =
    celestial.arcProgress > 0.72
      ? "right-0"
      : celestial.arcProgress < 0.28
        ? "left-0"
        : "left-1/2 -translate-x-1/2";
  const isMoon = celestial.body === "moon";

  return (
    <div
      className="absolute z-[5] -translate-x-1/2 -translate-y-1/2"
      style={celestialStyle}
    >
      <button
        type="button"
        aria-label={`Show Steven's local time in San Jose from the ${celestial.body}`}
        aria-expanded={timeVisible}
        className={`relative block size-20 rounded-full transition-transform duration-300 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 sm:size-24 ${
          isMoon
            ? "bg-[#f4f1d0] shadow-[0_0_24px_8px_rgba(226,232,240,0.45)]"
            : "bg-[#fff96b] shadow-[0_0_32px_12px_rgba(253,224,71,0.65)]"
        }`}
        onClick={handleTap}
        onMouseEnter={() => setTimeVisible(true)}
        onMouseLeave={dismissHover}
        onFocus={() => setTimeVisible(true)}
        onBlur={dismissHover}
      >
        {isMoon && (
          <>
            <span className="absolute left-[22%] top-[24%] size-[20%] rounded-full bg-[#c9c8b5]" />
            <span className="absolute right-[20%] top-[38%] size-[14%] rounded-full bg-[#d5d3ba]" />
            <span className="absolute bottom-[20%] left-[46%] size-[17%] rounded-full bg-[#c5c4b0]" />
          </>
        )}
      </button>

      {timeVisible && (
        <div className={`absolute bottom-[calc(100%+1rem)] ${tooltipAlignment}`}>
          <SunHover
            body={celestial.body}
            nextTransition={celestial.nextTransition}
            nextTransitionLabel={celestial.nextTransitionLabel}
          />
        </div>
      )}
    </div>
  );
}
