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
} from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { Vector3 } from "three";
import { Loader2 } from "lucide-react";

const getSunPosition = (hour: number) => {
  const angle = (hour / 24) * Math.PI * 2;
  return [Math.sin(angle) * 10, Math.cos(angle) * 10, -10];
};

const Scene = ({ onLoadingChange }: { onLoadingChange: Function }) => {
  const [sunPosition, setSunPosition] = useState([0, 10, -10]);
  let loaded = false;

  useEffect(() => {
    const updateSunPosition = () => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      setSunPosition(getSunPosition(hour));
    };

    updateSunPosition();
    const intervalId = setInterval(updateSunPosition, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {sunPosition ? <Sky sunPosition={new Vector3(...sunPosition)} /> : null}
      <ambientLight intensity={0.5} />
      <directionalLight position={new Vector3(...sunPosition)} intensity={1} />
      <Sphere
        onAfterRender={(e) => {
          if (!loaded) {
            loaded = true;
            onLoadingChange();
          }
        }}
        position={new Vector3(1, 3, 2)}
        args={[2, 15, 15]}
      >
        <meshBasicMaterial attach="material" color="yellow" />
      </Sphere>
      <OrbitControls />
    </>
  );
};

const TimeOfDayScene = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ width: "100%", height: "90vh" }}>
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
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
