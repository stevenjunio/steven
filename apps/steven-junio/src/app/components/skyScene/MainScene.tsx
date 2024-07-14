"use client";

import { extend } from "@react-three/fiber";
import { Sphere, Sky, OrbitControls, Html } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { AmbientLight, Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import SunHover from "./SunHover";
import { createPortal } from "react-dom";

const Scene = ({
  onLoadingChange,
}: {
  onLoadingChange: Function;
  sunIsHovered?: Boolean;
}) => {
  const sunPosition = [-25, 25, -120];
  const [sunHovered, setSunHovered] = useState(false);
  let loaded = false;
  extend({ SunHover });

  return (
    <>
      {
        <Sky
          turbidity={0}
          rayleigh={0.15}
          inclination={0.51}
          azimuth={0.55}
          distance={35}
        />
      }
      <EffectComposer>
        <Bloom
          intensity={3}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.025}
          kernelSize={5}
        />
      </EffectComposer>
      <Sphere
        onAfterRender={(e) => {
          if (!loaded) {
            loaded = true;
            onLoadingChange();
          }
        }}
        onPointerOver={(e) => setSunHovered(true)}
        onPointerOut={(e) => {
          setSunHovered(false);
        }}
        onPointerDown={(e) => {
          setSunHovered(true);
          setTimeout(() => {
            setSunHovered(false);
          }, 5000);
        }}
        position={new Vector3(sunPosition[0], sunPosition[1], sunPosition[2])}
        args={[2, 5, 5]}
      >
        <meshBasicMaterial attach="material" color="yellow" alphaHash={true} />
        {sunHovered ? (
          <Html position={[0, 10, 0]}>
            <SunHover />
          </Html>
        ) : null}
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
      />
    </>
  );
};
export default Scene;
