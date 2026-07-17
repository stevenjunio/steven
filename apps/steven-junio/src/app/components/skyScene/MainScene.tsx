"use client";

import { Sky, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { Vector3 } from "three";
import type { CelestialState } from "./celestialTime";
import type { WeatherVisualState } from "./weather";
import WeatherParticles from "./WeatherParticles";

type SceneProps = {
  celestial: CelestialState;
  weather: WeatherVisualState;
  reducedMotion: boolean;
};

export default function Scene({
  celestial,
  weather,
  reducedMotion,
}: SceneProps) {
  const skySunPosition = useMemo(
    () => new Vector3(...celestial.skySunPosition),
    [celestial.skySunPosition],
  );

  return (
    <Suspense fallback={null}>
      <Sky
        turbidity={weather.turbidity}
        rayleigh={weather.rayleigh}
        mieCoefficient={weather.mieCoefficient}
        mieDirectionalG={weather.mieDirectionalG}
        sunPosition={skySunPosition}
        distance={35}
      />

      {weather.starCount >= 16 && (
        <Stars
          radius={80}
          depth={35}
          count={weather.starCount}
          factor={3}
          saturation={0.15}
          fade
          speed={reducedMotion ? 0 : 0.12}
        />
      )}

      <WeatherParticles
        kind={weather.precipitation}
        intensity={weather.precipitationIntensity}
        color={weather.precipitationColor}
        wind={weather.cloudDriftDirection}
        reducedMotion={reducedMotion}
      />
    </Suspense>
  );
}
