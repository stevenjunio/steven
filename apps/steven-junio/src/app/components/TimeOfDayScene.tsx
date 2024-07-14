"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import Scene from "./skyScene/MainScene";
import CloudsComponent from "./skyScene/Clouds";

const TimeOfDayScene = () => {
  const handleContextMenu = useCallback((event: any) => {
    event.preventDefault();
  }, []);
  return (
    <div className="h-full h-90vh bg-gradient-to-b from-blue-300 to-gray-400  w-full fixed z-50 top-0">
      <Canvas onContextMenu={handleContextMenu}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene onLoadingChange={() => {}} />

        <CloudsComponent numberOfClouds={100} />
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
