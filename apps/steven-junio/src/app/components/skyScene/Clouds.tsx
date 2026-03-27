import * as THREE from "three";
import { useMemo } from "react";
import { Cloud } from "@react-three/drei";

export default function CloudsComponent({ numberOfClouds = 1 }: { numberOfClouds?: number }) {
  // Stabilise cloud positions so they don't jump on every render.
  // Uses a sine-based deterministic pseudo-random approach for even distribution.
  const cloudPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < numberOfClouds; i++) {
      // Three independent pseudo-random values per cloud using different seeds
      const r1 = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
      const r2 = (Math.sin(i * 269.5 + 183.3) * 43758.5453) % 1;
      const r3 = (Math.sin(i * 419.2 + 75.1) * 43758.5453) % 1;
      positions.push([
        (r1 - 0.5) * 500,      // X: -250 … 250
        Math.abs(r2) * 10 + 5, // Y: 5 … 15
        (r3 - 0.5) * 50,       // Z: -25 … 25
      ]);
    }
    return positions;
  }, [numberOfClouds]);

  return (
    <>
      <ambientLight intensity={1.7} />

      {cloudPositions.map((position, index) => (
        <Cloud
          key={index}
          opacity={numberOfClouds <= 20 ? 0.1 : 0.3}
          speed={0.1}
          color={"white"}
          position={new THREE.Vector3(position[0], position[1], position[2])}
        />
      ))}
    </>
  );
}
