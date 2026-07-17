"use client";

import type { CSSProperties } from "react";
import type { CelestialState } from "./celestialTime";
import type { WeatherVisualState } from "./weather";

type AtmosphereLayersProps = {
  celestial: CelestialState;
  weather: WeatherVisualState;
};

type AtmosphereStyle = CSSProperties & {
  "--sky-fog-opacity": number;
  "--sky-sun-x": string;
  "--sky-sun-y": string;
  "--sky-sun-rays": number;
  "--sky-lightning": number;
};

export default function AtmosphereLayers({
  celestial,
  weather,
}: AtmosphereLayersProps) {
  const arcHeight = Math.sin(Math.PI * celestial.arcProgress);
  const style: AtmosphereStyle = {
    "--sky-fog-opacity": weather.fogOpacity,
    "--sky-sun-x": `${8 + celestial.arcProgress * 84}%`,
    "--sky-sun-y": `${68 - arcHeight * 44}%`,
    "--sky-sun-rays": weather.sunRayOpacity,
    "--sky-lightning": weather.lightningIntensity,
  };

  return (
    <div
      aria-hidden="true"
      data-sky-phase={celestial.phase}
      data-sky-weather={weather.kind}
      className="pointer-events-none absolute inset-0 z-[6] overflow-hidden"
      style={style}
    >
      <div
        className="absolute inset-0"
        style={{ background: weather.skyTint }}
      />
      <div
        className="absolute inset-0"
        style={{ background: weather.horizonGlow }}
      />

      {weather.sunRayOpacity > 0.01 && (
        <div className="sky-sun-rays absolute inset-0" />
      )}

      {weather.fogOpacity > 0.01 && (
        <>
          <div className="sky-fog-band sky-fog-band-far absolute inset-x-[-30%] bottom-[-8%] h-[72%]" />
          <div className="sky-fog-band sky-fog-band-near absolute inset-x-[-35%] bottom-[-16%] h-[66%]" />
        </>
      )}

      {weather.precipitation !== "none" && (
        <div
          className={`sky-precipitation-veil absolute inset-0 sky-precipitation-${weather.precipitation}`}
        />
      )}

      {weather.lightningIntensity > 0 && (
        <div className="sky-lightning absolute inset-0" />
      )}

      <div
        className="absolute inset-0"
        style={{ background: weather.vignette }}
      />
    </div>
  );
}
