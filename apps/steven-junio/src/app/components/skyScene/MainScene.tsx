"use client";

import { OrbitControls, Sky, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { Vector3 } from "three";
import type { CelestialState } from "./celestialTime";

type SceneProps = {
  celestial: CelestialState;
};

export default function Scene({ celestial }: SceneProps) {
  const skySunPosition = useMemo(
    () => new Vector3(...celestial.skySunPosition),
    [celestial.skySunPosition],
  );

  const isNight = celestial.body === "moon";

  return (
    <Suspense fallback={null}>
      <Sky
        turbidity={isNight ? 4 : 2}
        rayleigh={isNight ? 0.25 : 1.4}
        sunPosition={skySunPosition}
        distance={35}
      />

      {isNight && (
        <Stars
          radius={80}
          depth={35}
          count={1800}
          factor={3}
          saturation={0.15}
          fade
          speed={0.15}
        />
      )}

      <OrbitControls
        panSpeed={0.05}
        maxAzimuthAngle={0.3}
        minAzimuthAngle={0.1}
        minPolarAngle={0.2}
        maxPolarAngle={2}
        maxDistance={10}
        minDistance={5}
        enablePan={false}
        enableRotate={false}
        enableDamping={false}
      />
    </Suspense>
  );
}
