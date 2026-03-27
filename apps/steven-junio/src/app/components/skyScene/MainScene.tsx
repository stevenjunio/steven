"use client";

import { Sphere, Sky, OrbitControls, Html, Stars } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import TimeTooltip from "./TimeTooltip";
import { getSanJoseHour } from "./skyUtils";

/**
 * Returns a normalised direction Vector3 for the sun at the given hour.
 * Hour 6 = east horizon, hour 12 = overhead (south), hour 18 = west horizon.
 * Outside 6-18 the sun is below the horizon (negative Y).
 */
function getSunVector(hour: number): Vector3 {
  const progress = (hour - 6) / 12; // 0 at 6 am, 1 at 6 pm
  const altitude = Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const x = (progress - 0.5) * 2; // -1 (east) … +1 (west)
  const y = altitude;
  // keep it a unit vector; push sun slightly in front of camera (-z) when low
  const z = -Math.sqrt(Math.max(0, 1 - x * x - y * y));
  return new Vector3(x, y, z).normalize();
}

/** Celestial body sphere position at `distance` units in the given direction. */
function celestialPos(dir: Vector3, distance: number): [number, number, number] {
  return [dir.x * distance, dir.y * distance, dir.z * distance];
}

const SPHERE_DISTANCE = 80;

const Scene = ({ onLoadingChange }: { onLoadingChange: Function }) => {
  const [currentHour, setCurrentHour] = useState(() => getSanJoseHour());
  const [sunHovered, setSunHovered] = useState(false);
  const [moonHovered, setMoonHovered] = useState(false);
  const sunTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update time every 10 seconds – smooth enough, not expensive
  useEffect(() => {
    const interval = setInterval(() => setCurrentHour(getSanJoseHour()), 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onLoadingChange(true);
    return () => onLoadingChange(false);
  }, [onLoadingChange]);

  // Clean up any pending timers on unmount
  useEffect(() => {
    return () => {
      if (sunTimerRef.current) clearTimeout(sunTimerRef.current);
      if (moonTimerRef.current) clearTimeout(moonTimerRef.current);
    };
  }, []);

  // ---------- time-based sky parameters ----------
  const isDay = currentHour >= 6 && currentHour <= 18;
  const isNight = currentHour < 5.5 || currentHour > 19.5;
  const isTwilight = !isDay && !isNight;

  const rayleigh = isNight ? 0.01 : isTwilight ? 1.5 : 0.15;
  const turbidity = isTwilight ? 4 : 0;

  // Sun direction & position
  const sunDir = useMemo(() => getSunVector(currentHour), [currentHour]);
  const sunPos = useMemo(
    () => celestialPos(sunDir, SPHERE_DISTANCE),
    [sunDir]
  );
  // sunPosition for the Sky shader (unit vector)
  const skyProps = useMemo(
    () => ({ sunPosition: [sunDir.x, sunDir.y, sunDir.z] as [number, number, number] }),
    [sunDir]
  );

  // Moon is 12 hours offset from the sun
  const moonDir = useMemo(
    () => getSunVector((currentHour + 12) % 24),
    [currentHour]
  );
  const moonPos = useMemo(
    () => celestialPos(moonDir, SPHERE_DISTANCE),
    [moonDir]
  );

  const showSun = isDay || isTwilight;
  const showMoon = isNight || isTwilight;
  const showStars = isNight;

  // ---------- event handlers ----------
  const handleSunPointerOver = useCallback(() => setSunHovered(true), []);
  const handleSunPointerOut = useCallback(() => setSunHovered(false), []);
  const handleSunPointerDown = useCallback(() => {
    if (sunTimerRef.current) clearTimeout(sunTimerRef.current);
    setSunHovered(true);
    sunTimerRef.current = setTimeout(() => setSunHovered(false), 5000);
  }, []);

  const handleMoonPointerOver = useCallback(() => setMoonHovered(true), []);
  const handleMoonPointerOut = useCallback(() => setMoonHovered(false), []);
  const handleMoonPointerDown = useCallback(() => {
    if (moonTimerRef.current) clearTimeout(moonTimerRef.current);
    setMoonHovered(true);
    moonTimerRef.current = setTimeout(() => setMoonHovered(false), 5000);
  }, []);

  return (
    <Suspense fallback={null}>
      <Sky
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        sunPosition={skyProps.sunPosition}
        distance={450000}
      />

      {showStars && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      )}

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={showSun ? 3 : 1.5}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.025}
          kernelSize={3}
        />
      </EffectComposer>

      {/* Sun */}
      {showSun && (
        <Sphere
          onPointerOver={handleSunPointerOver}
          onPointerOut={handleSunPointerOut}
          onPointerDown={handleSunPointerDown}
          position={sunPos}
          args={[2, 32, 32]}
        >
          <meshBasicMaterial color="yellow" />
          {sunHovered && (
            <Html center position={[0, 5, 0]}>
              <TimeTooltip />
            </Html>
          )}
        </Sphere>
      )}

      {/* Moon */}
      {showMoon && (
        <Sphere
          onPointerOver={handleMoonPointerOver}
          onPointerOut={handleMoonPointerOut}
          onPointerDown={handleMoonPointerDown}
          position={moonPos}
          args={[1.8, 32, 32]}
        >
          <meshBasicMaterial color="#d0d8e8" />
          {moonHovered && (
            <Html center position={[0, 5, 0]}>
              <TimeTooltip />
            </Html>
          )}
        </Sphere>
      )}

      <OrbitControls
        panSpeed={0.05}
        maxAzimuthAngle={0.3}
        minAzimuthAngle={0.1}
        minPolarAngle={0.2}
        maxPolarAngle={2}
        maxDistance={10}
        minDistance={5}
        enablePan={false}
        enableRotate={false}
        enableDamping={false}
      />
    </Suspense>
  );
};

export default Scene;
