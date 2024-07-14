import * as THREE from "three";
import { Cloud, Clouds } from "@react-three/drei";

export default function CloudsComponent({ numberOfClouds = 1 }) {
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

      <Clouds>
        <Cloud
          opacity={0.5}
          speed={0.15}
          color={"white"}
          segments={200}
          position={[0, -20, -50]}
          bounds={[65, -10, -15]}
          volume={7}
          //        position={[0, 6, -50]}
        />
      </Clouds>
    </>
  );
}
