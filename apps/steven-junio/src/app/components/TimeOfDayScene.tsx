"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import Clouds from "./skyScene/Clouds";
import Scene from "./skyScene/MainScene";

const TimeOfDayScene = () => {
  const [loading, setLoading] = useState(true);
  const handleContextMenu = useCallback((event: any) => {
    event.preventDefault();
    console.log(`right click on canvas`);
  }, []);
  return (
    <div className="h-full h-90vh">
      {loading ? (
        <div
          id="loader"
          className="bg-gradient-to-b from-blue-300 to-gray-400 h-screen w-full fixed z-50 top-0"
        />
      ) : null}
      <Canvas onContextMenu={handleContextMenu}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene
          onLoadingChange={() => {
            setLoading(false);
          }}
        />

        <Clouds numberOfClouds={200} />
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
