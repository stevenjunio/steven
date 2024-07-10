"use client";

import { Canvas } from "@react-three/fiber";
import {
  Sphere,
  Sky,
  OrbitControls,
  useProgress,
  Html,
  Loader,
  Text,
  Cloud,
} from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { MeshBasicMaterial, PointLight, Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

const getSunPosition = (hour: number) => {
  console.log(`Hour: ${hour}`);
  //-4, 0, 1 being the start of the day
  //0, 5, 1 being the peak of the sky
  //4,0, 1 being the end of the day

  return [-4, 0, 2];
};
const Clouds = () => {
  return <Cloud speed={0.05} position={[0, 0, 0]} />;
};

const Scene = ({ onLoadingChange }: { onLoadingChange: Function }) => {
  const [sunPosition, setSunPosition] = useState([0, 10, -10]);
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
      {sunPosition ? <Sky sunPosition={new Vector3(...sunPosition)} /> : null}
      <ambientLight intensity={0.5} color={"#ffffff"} />
      <directionalLight position={new Vector3(...sunPosition)} intensity={1} />
      <EffectComposer>
        <Bloom
          intensity={3}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.025}
          kernelSize={5}
        />
      </EffectComposer>
      <pointLight
        position={new Vector3(1, 4, 2)}
        args={[2, 15, 15]}
        color={"red"}
        intensity={1}
        distance={10}
        decay={2}
      />
      <Sphere
        onAfterRender={(e) => {
          if (!loaded) {
            loaded = true;
            onLoadingChange();
          }
        }}
        position={new Vector3(sunPosition[0], sunPosition[1], sunPosition[2])}
        args={[2, 15, 15]}
      >
        <meshBasicMaterial attach="material" color="yellow" alphaHash={true} />
      </Sphere>
      <OrbitControls maxDistance={10} minDistance={5} />
    </>
  );
};

const TimeOfDayScene = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div className="h-full h-90vh">
      {loading ? (
        <div
          id="loader"
          className="bg-gradient-to-b from-blue-300 to-gray-400 h-screen w-full fixed z-50 top-0"
        />
      ) : null}
      <Canvas>
        <Scene
          onLoadingChange={() => {
            console.log(`finally loaded`);
            setLoading(false);
          }}
        />
        <Clouds />
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
