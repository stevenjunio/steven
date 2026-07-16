"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Scene from "./skyScene/MainScene";
import CloudsComponent from "./skyScene/Clouds";
import CelestialControl from "./skyScene/CelestialControl";
import {
  getCelestialState,
  type CelestialState,
} from "./skyScene/celestialTime";

type CanvasReadyProps = {
  onReady: () => void;
};

function CanvasReady({ onReady }: CanvasReadyProps) {
  const hasReportedReady = useRef(false);

  useFrame(() => {
    if (hasReportedReady.current) return;

    hasReportedReady.current = true;
    onReady();
  });

  return null;
}

const TimeOfDayScene = () => {
  const [celestial, setCelestial] = useState<CelestialState | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

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
  const handleCanvasReady = useCallback(() => setCanvasReady(true), []);

  if (!celestial) {
    return <div className="h-full w-full bg-[#080b16]" />;
  }

  const fallbackBackground =
    celestial.body === "moon"
      ? "linear-gradient(to bottom, #080b16 0%, #171927 55%, #312c2b 100%)"
      : "linear-gradient(to bottom, #60a5fa 0%, #93c5fd 45%, #9ca3af 100%)";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: fallbackBackground }}
    >
      <Canvas
        frameloop="always"
        onContextMenu={handleContextMenu}
        style={{
          opacity: canvasReady ? 1 : 0,
          transition: "opacity 240ms ease-out",
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene celestial={celestial} />

        <CloudsComponent numberOfClouds={100} />
        <CanvasReady onReady={handleCanvasReady} />
      </Canvas>

      <CelestialControl celestial={celestial} />
    </div>
  );
};

export default TimeOfDayScene;
