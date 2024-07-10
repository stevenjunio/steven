"use client";

import { Canvas } from "@react-three/fiber";
import {
  Sphere,
  Sky,
  OrbitControls,
  Cloud,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { AmbientLight, Vector3 } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Clouds from "./skyScene/Clouds";
import Scene from "./skyScene/MainScene";

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
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Scene
          onLoadingChange={() => {
            console.log(`finally loaded`);
            setLoading(false);
          }}
        />

        <Clouds numberOfClouds={200} />
      </Canvas>
    </div>
  );
};

export default TimeOfDayScene;
