"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMoteDotTexture } from "@/lib/soft-textures";
import { isInsideHeroSafeZone } from "@/lib/hero-safe-zone";

type MotesProps = {
  reducedMotion: boolean;
};

const MOTE_COUNT = 60;

/** Deterministic hash-based pseudo-random in [0, 1), stable across renders. */
function hash(seed: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

const MOTE_SEEDS = (() => {
  const positions = new Float32Array(MOTE_COUNT * 3);
  const drift = new Float32Array(MOTE_COUNT * 2); // [speed, phase]

  let i = 0;
  let attempt = 0;
  while (i < MOTE_COUNT && attempt < MOTE_COUNT * 20) {
    const rx = hash(attempt * 3.1 + 1);
    const ry = hash(attempt * 5.7 + 2);
    const rz = hash(attempt * 7.3 + 3);
    attempt++;

    const x = (rx - 0.5) * 14;
    const y = (ry - 0.5) * 6 + 0.5;
    const z = -1.5 - rz * 8;
    if (isInsideHeroSafeZone(x, y, z)) continue;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    drift[i * 2] = 0.04 + hash(attempt * 9.1 + 4) * 0.06;
    drift[i * 2 + 1] = hash(attempt * 11.3 + 5) * Math.PI * 2;
    i++;
  }

  return { positions, drift, count: i };
})();

export function Motes({ reducedMotion }: MotesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => getMoteDotTexture(), []);
  const basePositions = useMemo(() => MOTE_SEEDS.positions.slice(), []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points || reducedMotion) return;

    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const elapsed = clock.elapsedTime;

    for (let i = 0; i < MOTE_SEEDS.count; i++) {
      const speed = MOTE_SEEDS.drift[i * 2];
      const phase = MOTE_SEEDS.drift[i * 2 + 1];
      const t = elapsed * speed + phase;
      attr.array[i * 3] = basePositions[i * 3] + Math.sin(t) * 0.3;
      attr.array[i * 3 + 1] = basePositions[i * 3 + 1] + Math.cos(t * 0.6) * 0.22;
    }
    attr.needsUpdate = true;
  });

  if (!texture) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[MOTE_SEEDS.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.09}
        color={"#ffffff"}
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
