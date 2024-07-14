"use client";

import { extend } from "@react-three/fiber";
import { Sphere, Sky, OrbitControls, Html } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { AmbientLight, Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import SunHover from "./SunHover";
import { createPortal } from "react-dom";

const getSunPosition = (hour: number) => {
  console.log(`Hour: ${hour}`);
  //-4, 0, 1 being the start of the day
  //0, 5, 1 being the peak of the sky
  //4,0, 1 being the end of the day
  //tbd dynamic sun position based on time of day in PST
  return [-25, 25, -120];
};
const Scene = ({
  onLoadingChange,
}: {
  onLoadingChange: Function;
  sunIsHovered?: Boolean;
}) => {
  const [sunPosition, setSunPosition] = useState([0, 15, -10]);
  const [sunHovered, setSunHovered] = useState(false);
  let loaded = false;
  extend({ SunHover });

  useEffect(() => {
    const updateSunPosition = () => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      setSunPosition(getSunPosition(hour));
      console.log(`Sun position: ${sunPosition}`);
    };

    updateSunPosition();
    const intervalId = setInterval(updateSunPosition, 1000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {sunPosition ? (
        <Sky
          turbidity={0}
          rayleigh={0.15}
          inclination={0.51}
          azimuth={0.55}
          distance={35}
        />
      ) : null}
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
          console.log(`Pointer out`, e);
          setSunHovered(false);
        }}
        onPointerDown={(e) => {
          console.log(`Pointer enter`, e);
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
