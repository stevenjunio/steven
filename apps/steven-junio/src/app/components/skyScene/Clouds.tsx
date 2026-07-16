"use client";

import { Cloud } from "@react-three/drei";
import { useMemo } from "react";

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12_989.8) * 43_758.5453;
  return value - Math.floor(value);
}

export default function CloudsComponent({ numberOfClouds = 1 }) {
  const cloudPositions = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: numberOfClouds }, (_, index) => [
        (seededRandom(index * 3 + 1) - 0.5) * 500,
        seededRandom(index * 3 + 2) * 10 + 5,
        (seededRandom(index * 3 + 3) - 0.5) * 50,
      ]),
    [numberOfClouds],
  );

  return (
    <>
      <ambientLight intensity={1.7} />
      {cloudPositions.map((position, index) => (
        <Cloud
          key={index}
          opacity={0.3}
          speed={0.1}
          color="white"
          position={position}
        />
      ))}
    </>
  );
}
