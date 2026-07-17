"use client";

import { useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef } from "react";
import {
  Color,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  NormalBlending,
  ShaderMaterial,
} from "three";
import type { PrecipitationKind } from "./weather";

type WeatherParticlesProps = {
  kind: PrecipitationKind;
  intensity: number;
  color: string;
  wind: number;
  reducedMotion: boolean;
};

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSnow;
  uniform float uWind;
  uniform float uIntensity;

  attribute vec3 aOffset;
  attribute float aSeed;

  varying vec2 vUv;
  varying float vAlpha;
  varying float vSnow;

  void main() {
    float fallSpeed = mix(0.62, 0.11, uSnow) * mix(0.82, 1.35, uIntensity);
    float cycle = fract(aSeed + uTime * fallSpeed * mix(0.78, 1.24, aSeed));
    vec3 center = aOffset;

    center.y = mix(15.0, -13.0, cycle);
    center.x += uWind * (cycle - 0.5) * mix(4.2, 7.0, uIntensity);
    center.x += sin(uTime * 0.7 + aSeed * 38.0 + cycle * 8.0) * uSnow * 1.15;

    vec2 corner = position.xy;
    float particleWidth = mix(0.035, 0.18, uSnow) * mix(0.72, 1.28, aSeed);
    float particleHeight = mix(1.05, 0.18, uSnow) * mix(0.72, 1.3, aSeed);

    center.x += corner.x * particleWidth + corner.y * uWind * 0.32 * (1.0 - uSnow);
    center.y += corner.y * particleHeight;

    vec4 modelViewPosition = modelViewMatrix * vec4(center, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vUv = uv;
    vSnow = uSnow;
    vAlpha = mix(0.24, 0.7, aSeed) * mix(0.68, 1.0, uIntensity);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;

  varying vec2 vUv;
  varying float vAlpha;
  varying float vSnow;

  void main() {
    vec2 centered = vUv - 0.5;
    float rainShape =
      smoothstep(0.5, 0.12, abs(centered.x)) *
      smoothstep(0.52, 0.36, abs(centered.y));
    float snowShape = smoothstep(0.5, 0.12, length(centered));
    float shape = mix(rainShape, snowShape, vSnow);

    if (shape < 0.02) discard;

    gl_FragColor = vec4(uColor, shape * vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function seededRandom(seed: number) {
  const value = Math.sin(seed * 9_731.17) * 31_337.271;
  return value - Math.floor(value);
}

function createParticleGeometry(count: number) {
  const geometry = new InstancedBufferGeometry();
  const positions = new Float32Array([
    -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5,
    0.5, 0, -0.5, 0.5, 0,
  ]);
  const uvs = new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
  ]);
  const offsets = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const depth = seededRandom(index * 4 + 3);
    offsets[index * 3] = (seededRandom(index * 4 + 1) - 0.5) * 58;
    offsets[index * 3 + 1] = 0;
    offsets[index * 3 + 2] = -3 - depth * 24;
    seeds[index] = seededRandom(index * 4 + 4);
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  geometry.instanceCount = count;

  return geometry;
}

function ActiveWeatherParticles({
  kind,
  intensity,
  color,
  wind,
}: WeatherParticlesProps) {
  const particleCount = Math.round(72 + intensity * 138);
  const geometry = useMemo(
    () => createParticleGeometry(particleCount),
    [particleCount],
  );
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSnow: { value: kind === "snow" ? 1 : 0 },
      uWind: { value: wind },
      uIntensity: { value: intensity },
      uColor: { value: new Color(color) },
    }),
    [color, intensity, kind, wind],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={5}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={NormalBlending}
        toneMapped
      />
    </mesh>
  );
}

function WeatherParticles(props: WeatherParticlesProps) {
  if (props.kind === "none" || props.reducedMotion) return null;

  return <ActiveWeatherParticles {...props} />;
}

export default memo(WeatherParticles);
