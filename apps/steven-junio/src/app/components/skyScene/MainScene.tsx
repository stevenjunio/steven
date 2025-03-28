"use client";

import { extend, useThree, useFrame } from "@react-three/fiber";
import { Sphere, Sky, OrbitControls, Html } from "@react-three/drei";
import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import SunHover from "./SunHover";

const Scene = ({
  onLoadingChange,
}: {
  onLoadingChange: Function;
  sunIsHovered?: Boolean;
}) => {
  const sunPosition = useMemo(() => new Vector3(-25, 25, -120), []);
  const [sunHovered, setSunHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  extend({ SunHover });

  // Inform parent component about loading state changes
  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      onLoadingChange(true);
    }
    return () => onLoadingChange(false);
  }, [isLoaded, onLoadingChange]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handlePointerOver = useCallback(() => setSunHovered(true), []);
  const handlePointerOut = useCallback(() => setSunHovered(false), []);
  const handlePointerDown = useCallback(() => {
    setSunHovered(true);
    // Clear any existing timers when component unmounts
    const timer = setTimeout(() => setSunHovered(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Memoize the sun's geometry arguments to prevent recreating them on each render
  const sphereArgs = useMemo(() => [2, 32, 32], []); // Reduced segment count from [2, 5, 5]

  return (
    <Suspense fallback={null}>
      <Sky
        turbidity={0}
        rayleigh={0.15}
        inclination={0.51}
        azimuth={0.55}
        distance={35}
      />

      {/* Only render EffectComposer when needed */}
      <EffectComposer enabled={true} multisampling={0}>
        <Bloom
          intensity={3}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.025}
          kernelSize={3} // Reduced from 5 for better performance
        />
      </EffectComposer>

      <Sphere
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        position={sunPosition}
        args={[2, 5, 5]}
      >
        <meshBasicMaterial attach="material" color="yellow" alphaHash={true} />
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
        enableDamping={false} // Disable damping for better performance
      />
    </Suspense>
  );
};

export default Scene;
