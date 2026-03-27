"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useCallback, useMemo } from "react";
import Scene from "./skyScene/MainScene";
import CloudsComponent from "./skyScene/Clouds";
import { getSanJoseHour } from "./skyScene/skyUtils";

function getBgGradient(hour: number): string {
  if (hour >= 5.5 && hour < 8) return "from-orange-300 to-blue-400";   // dawn
  if (hour >= 8 && hour < 17) return "from-blue-400 to-blue-200";       // day
  if (hour >= 17 && hour < 20) return "from-orange-500 to-purple-700";  // dusk
  return "from-gray-900 to-blue-950";                                    // night
}

const TimeOfDayScene = () => {
  const currentHour = useMemo(() => getSanJoseHour(), []);
  const bgGradient = useMemo(() => getBgGradient(currentHour), [currentHour]);

  const handleContextMenu = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  return (
    <div className={`h-full h-90vh bg-gradient-to-b ${bgGradient} w-full fixed z-50 top-0`}>
      <Canvas onContextMenu={handleContextMenu}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene onLoadingChange={() => {}} />
        <CloudsComponent numberOfClouds={currentHour >= 19.5 || currentHour < 5.5 ? 20 : 100} />
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
