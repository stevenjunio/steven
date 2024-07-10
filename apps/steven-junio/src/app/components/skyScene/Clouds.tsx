import * as THREE from "three";
import { Cloud } from "@react-three/drei";

export default function Clouds({ numberOfClouds = 1 }) {
  const cloudPositions = [];

  // Generate random cloud positions
  for (let i = 0; i < numberOfClouds; i++) {
    cloudPositions.push([
      (Math.random() - 0.5) * 500, // X position
      Math.random() * 10 + 5, // Y position
      (Math.random() - 0.5) * 50, // Z position
    ]);
  }

  return (
    <>
      <ambientLight intensity={1.7} />

      {cloudPositions.map((position, index) => (
        <Cloud
          key={index}
          opacity={0.3}
          speed={0.1}
          color={"white"}
          //        position={[0, 6, -50]}

          position={
            new THREE.Vector3(
              position[0],
              Math.floor(Math.random() * (-25 - -5 + 1) + -3),
              -15
            )
          }
        />
      ))}
    </>
  );
}
