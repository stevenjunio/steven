"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useCallback, type MouseEvent } from "react";
import Scene from "./skyScene/MainScene";
import CloudsComponent from "./skyScene/Clouds";

const TimeOfDayScene = () => {
  const handleContextMenu = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);
  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-300 to-gray-400">
      <Canvas onContextMenu={handleContextMenu}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene />

        <CloudsComponent numberOfClouds={100} />
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
