"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import Scene from "./skyScene/MainScene";
import CloudsComponent from "./skyScene/Clouds";
import CelestialControl from "./skyScene/CelestialControl";
import AtmosphereLayers from "./skyScene/AtmosphereLayers";
import {
  getCelestialState,
  type CelestialState,
  type SkyPhase,
} from "./skyScene/celestialTime";
import {
  FALLBACK_WEATHER,
  getWeatherVisualState,
  type WeatherSnapshot,
} from "./skyScene/weather";

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

type DemandFrameLoopProps = {
  paused: boolean;
  framesPerSecond?: number;
};

function DemandFrameLoop({
  paused,
  framesPerSecond = 30,
}: DemandFrameLoopProps) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    if (paused) return;

    let animationFrame = 0;
    let lastFrame = 0;
    const frameInterval = 1000 / framesPerSecond;

    const render = (time: number) => {
      animationFrame = window.requestAnimationFrame(render);

      if (
        document.visibilityState === "visible" &&
        time - lastFrame >= frameInterval
      ) {
        lastFrame = time - ((time - lastFrame) % frameInterval);
        invalidate();
      }
    };

    animationFrame = window.requestAnimationFrame(render);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [framesPerSecond, invalidate, paused]);

  return null;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

const FALLBACK_BACKGROUNDS: Record<SkyPhase, string> = {
  night:
    "linear-gradient(to bottom, #050814 0%, #111a32 58%, #373347 100%)",
  dawn:
    "linear-gradient(to bottom, #173561 0%, #6f7898 56%, #dc916f 100%)",
  "golden-hour":
    "linear-gradient(to bottom, #4e93cc 0%, #9fc6df 54%, #efac73 100%)",
  day: "linear-gradient(to bottom, #4c9ee6 0%, #83c5ed 52%, #d2e8ef 100%)",
  dusk:
    "linear-gradient(to bottom, #142c54 0%, #665878 57%, #c66d65 100%)",
};

const TimeOfDayScene = () => {
  const [celestial, setCelestial] = useState<CelestialState | null>(null);
  const [weather, setWeather] =
    useState<WeatherSnapshot>(FALLBACK_WEATHER);
  const [canvasReady, setCanvasReady] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const updateCelestial = () => {
      if (document.visibilityState === "visible") {
        setCelestial(getCelestialState());
      }
    };
    const initialUpdate = window.setTimeout(
      updateCelestial,
      0,
    );
    const timer = window.setInterval(updateCelestial, 15_000);
    document.addEventListener("visibilitychange", updateCelestial);

    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateCelestial);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let activeController: AbortController | null = null;

    const updateWeather = async () => {
      if (document.visibilityState !== "visible") return;

      activeController?.abort();
      activeController = new AbortController();

      try {
        const response = await fetch("/api/weather", {
          signal: activeController.signal,
        });

        if (!response.ok) return;

        const nextWeather = (await response.json()) as WeatherSnapshot;
        if (isMounted) setWeather(nextWeather);
      } catch {
        // Keep the last known or polished fallback state when weather is offline.
      }
    };

    void updateWeather();
    const timer = window.setInterval(updateWeather, 5 * 60 * 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void updateWeather();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleCanvasReady = useCallback(() => setCanvasReady(true), []);

  if (!celestial) {
    return <div className="h-full w-full bg-[#080b16]" />;
  }

  const fallbackBackground = FALLBACK_BACKGROUNDS[celestial.phase];
  const weatherVisual = getWeatherVisualState(weather, celestial.phase);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: fallbackBackground }}
    >
      <Canvas
        className="pointer-events-none"
        frameloop="demand"
        dpr={[1, 1.4]}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "low-power",
          stencil: false,
        }}
        style={{
          opacity: canvasReady ? 1 : 0,
          transition: "opacity 240ms ease-out",
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene
          celestial={celestial}
          weather={weatherVisual}
          reducedMotion={reducedMotion}
        />

        <Suspense fallback={null}>
          <CloudsComponent
            numberOfClouds={weatherVisual.cloudCount}
            opacity={weatherVisual.cloudOpacity}
            color={weatherVisual.cloudColor}
            shadowColor={weatherVisual.cloudShadowColor}
            speed={weatherVisual.cloudSpeed}
            driftSpeed={weatherVisual.cloudDriftSpeed}
            driftDirection={weatherVisual.cloudDriftDirection}
            ambientLight={weatherVisual.ambientLight}
            reducedMotion={reducedMotion}
          />
        </Suspense>
        <DemandFrameLoop paused={reducedMotion} />
        <CanvasReady onReady={handleCanvasReady} />
      </Canvas>

      <CelestialControl
        celestial={celestial}
        weather={weather}
        visual={weatherVisual}
      />
      <AtmosphereLayers celestial={celestial} weather={weatherVisual} />
    </div>
  );
};

export default TimeOfDayScene;
