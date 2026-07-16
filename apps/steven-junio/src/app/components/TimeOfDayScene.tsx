"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import Scene from "./skyScene/MainScene";
import CloudsComponent from "./skyScene/Clouds";
import CelestialControl from "./skyScene/CelestialControl";
import {
  getCelestialState,
  type CelestialState,
} from "./skyScene/celestialTime";

const TimeOfDayScene = () => {
  const [celestial, setCelestial] = useState<CelestialState | null>(null);

  useEffect(() => {
    const initialUpdate = window.setTimeout(
      () => setCelestial(getCelestialState()),
      0,
    );
    const timer = window.setInterval(
      () => setCelestial(getCelestialState()),
      15_000,
    );

    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(timer);
    };
  }, []);

  const handleContextMenu = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  if (!celestial) {
    return (
      <div className="h-full w-full bg-gradient-to-b from-blue-300 to-gray-400" />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-blue-300 to-gray-400">
      <Canvas frameloop="always" onContextMenu={handleContextMenu}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene celestial={celestial} />

        <CloudsComponent numberOfClouds={100} />
      </Canvas>

      <CelestialControl celestial={celestial} />
    </div>
  );
};

export default TimeOfDayScene;
