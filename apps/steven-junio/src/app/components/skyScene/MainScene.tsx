"use client";

import { Sphere, Sky, OrbitControls, Html } from "@react-three/drei";
import { Suspense, useState, useCallback, useMemo } from "react";
import { Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import SunHover from "./SunHover";

export default function Scene() {
  const sunPosition = useMemo(() => new Vector3(-25, 25, -120), []);
  const [sunHovered, setSunHovered] = useState(false);

  const handlePointerOver = useCallback(() => setSunHovered(true), []);
  const handlePointerOut = useCallback(() => setSunHovered(false), []);
  const handlePointerDown = useCallback(() => {
    setSunHovered(true);
    setTimeout(() => setSunHovered(false), 5000);
  }, []);

  return (
    <Suspense fallback={null}>
      <Sky
        turbidity={0}
        rayleigh={0.15}
        inclination={0.51}
        azimuth={0.55}
        distance={35}
      />

      <EffectComposer enabled multisampling={0}>
        <Bloom
          intensity={3}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.025}
          kernelSize={3}
        />
      </EffectComposer>

      <Sphere
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        position={sunPosition}
        args={[2, 5, 5]}
      >
        <meshBasicMaterial attach="material" color="yellow" alphaHash />
        {sunHovered && (
          <Html position={[0, 10, 0]} transform occlude>
            <SunHover />
          </Html>
        )}
      </Sphere>

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
