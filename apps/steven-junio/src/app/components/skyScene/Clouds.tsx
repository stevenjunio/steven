"use client";

import { CloudInstance, Clouds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import type { Group } from "three";

type CloudsComponentProps = {
  numberOfClouds: number;
  opacity: number;
  color: string;
  shadowColor: string;
  speed: number;
  driftSpeed: number;
  driftDirection: number;
  ambientLight: number;
  reducedMotion: boolean;
};

type CloudBankConfig = {
  id: number;
  segments: number;
  position: [number, number, number];
  bounds: [number, number, number];
  scale: [number, number, number];
  volume: number;
  opacityScale: number;
  depthSpeed: number;
};

const CLOUD_INSTANCE_LIMIT = 128;
const CLOUD_WRAP_WIDTH = 94;

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12_989.8) * 43_758.5453;
  return value - Math.floor(value);
}

function wrap(value: number, minimum: number, maximum: number) {
  const range = maximum - minimum;
  return ((((value - minimum) % range) + range) % range) + minimum;
}

function buildCloudBanks(segmentBudget: number): CloudBankConfig[] {
  const safeBudget = Math.min(
    CLOUD_INSTANCE_LIMIT,
    Math.max(4, Math.round(segmentBudget)),
  );
  const bankCount = Math.min(9, Math.max(1, Math.ceil(safeBudget / 14)));
  let remainingSegments = safeBudget;

  return Array.from({ length: bankCount }, (_, index) => {
    const remainingBanks = bankCount - index;
    const segments = Math.max(
      4,
      Math.round(remainingSegments / remainingBanks),
    );
    remainingSegments -= segments;

    const layer = index % 3;
    const depth = layer === 0 ? -34 : layer === 1 ? -22 : -12;
    const layerScale = layer === 0 ? 1.5 : layer === 1 ? 1.12 : 0.88;

    return {
      id: index,
      segments,
      position: [
        (seededRandom(index * 7 + 1) - 0.5) * CLOUD_WRAP_WIDTH,
        1.8 + layer * 2.4 + seededRandom(index * 7 + 2) * 8.5,
        depth - seededRandom(index * 7 + 3) * 4,
      ],
      bounds: [
        3.8 + seededRandom(index * 7 + 4) * 3.2,
        0.72 + seededRandom(index * 7 + 5) * 0.72,
        1.1 + seededRandom(index * 7 + 6) * 1.1,
      ],
      scale: [
        layerScale * (0.9 + seededRandom(index * 7 + 7) * 0.42),
        layerScale * (0.72 + seededRandom(index * 7 + 8) * 0.26),
        layerScale,
      ],
      volume: 6.2 + seededRandom(index * 7 + 9) * 2.8,
      opacityScale: layer === 0 ? 0.72 : layer === 1 ? 0.9 : 1,
      depthSpeed: layer === 0 ? 0.42 : layer === 1 ? 0.72 : 1,
    };
  });
}

type DriftingCloudBankProps = {
  bank: CloudBankConfig;
  color: string;
  opacity: number;
  speed: number;
  driftSpeed: number;
  driftDirection: number;
  reducedMotion: boolean;
};

function DriftingCloudBank({
  bank,
  color,
  opacity,
  speed,
  driftSpeed,
  driftDirection,
  reducedMotion,
}: DriftingCloudBankProps) {
  const cloudRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!cloudRef.current || reducedMotion) return;

    cloudRef.current.position.x = wrap(
      bank.position[0] +
        clock.elapsedTime * driftSpeed * driftDirection * bank.depthSpeed,
      -CLOUD_WRAP_WIDTH / 2,
      CLOUD_WRAP_WIDTH / 2,
    );
  });

  return (
    <CloudInstance
      ref={cloudRef}
      seed={bank.id + 17}
      segments={bank.segments}
      position={bank.position}
      bounds={bank.bounds}
      scale={bank.scale}
      volume={bank.volume}
      smallestVolume={0.3}
      growth={reducedMotion ? 0 : 0.8}
      opacity={opacity * bank.opacityScale}
      speed={reducedMotion ? 0 : speed}
      color={color}
      fade={18}
    />
  );
}

function CloudsComponent({
  numberOfClouds,
  opacity,
  color,
  shadowColor,
  speed,
  driftSpeed,
  driftDirection,
  ambientLight,
  reducedMotion,
}: CloudsComponentProps) {
  const cloudBanks = useMemo(
    () => buildCloudBanks(numberOfClouds),
    [numberOfClouds],
  );
  const instanceCount = cloudBanks.reduce(
    (total, cloud) => total + cloud.segments,
    0,
  );

  return (
    <>
      <ambientLight intensity={ambientLight} />
      <directionalLight
        color="#fff4df"
        intensity={ambientLight * 0.34}
        position={[-8, 12, 6]}
      />

      <Clouds
        texture="/images/cloud-puff.svg"
        limit={CLOUD_INSTANCE_LIMIT}
        range={instanceCount}
        frustumCulled={false}
      >
        {cloudBanks.map((bank) => (
          <DriftingCloudBank
            key={bank.id}
            bank={bank}
            color={bank.id % 4 === 3 ? shadowColor : color}
            opacity={opacity}
            speed={speed}
            driftSpeed={driftSpeed}
            driftDirection={driftDirection}
            reducedMotion={reducedMotion}
          />
        ))}
      </Clouds>
    </>
  );
}

export default memo(CloudsComponent);
