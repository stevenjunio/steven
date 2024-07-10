"use client";

import { Canvas } from "@react-three/fiber";
import { Sphere, Sky, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { AmbientLight, Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import SunHover from "./SunHover";

const getSunPosition = (hour: number) => {
  console.log(`Hour: ${hour}`);
  //-4, 0, 1 being the start of the day
  //0, 5, 1 being the peak of the sky
  //4,0, 1 being the end of the day

  return [-25, 20, -120];
};
const Scene = ({
  onLoadingChange,
}: {
  onLoadingChange: Function;
  sunIsHovered?: Boolean;
}) => {
  const [sunPosition, setSunPosition] = useState([0, 10, -10]);
  const [sunHovered, setSunHovered] = useState(false);
  let loaded = false;

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
          rayleigh={0.1}
          inclination={0.51}
          azimuth={0.35}
          distance={1000}
        />
      ) : null}
      <EffectComposer>
        <Bloom
          intensity={3}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.025}
          kernelSize={5}
        />
      </EffectComposer>{" "}
      <Sphere
        onAfterRender={(e) => {
          if (!loaded) {
            loaded = true;
            onLoadingChange();
          }
        }}
        onPointerOver={(e) => setSunHovered(true)}
        position={new Vector3(sunPosition[0], sunPosition[1], sunPosition[2])}
        args={[2, 15, 15]}
      >
        <meshBasicMaterial attach="material" color="yellow" alphaHash={true} />
      </Sphere>
      <OrbitControls maxDistance={10} minDistance={5} />
      {sunHovered ? <SunHover /> : null}
    </>
  );
};
export default Scene;
