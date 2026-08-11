"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCloudPuffTexture } from "@/lib/soft-textures";

type CloudFieldProps = {
  reducedMotion: boolean;
};

type PuffConfig = {
  position: [number, number, number];
  scale: number;
  color: string;
  opacity: number;
  driftSpeed: number;
  driftAmount: number;
  phase: number;
};

function withPhase(config: Omit<PuffConfig, "phase">, seed: number): PuffConfig {
  return { ...config, phase: seed };
}

// Two parallax bands: a low horizon bank framing the base of the scene,
// and a few higher wisps for depth. Kept intentionally sparse.
const PUFFS: PuffConfig[] = [
  withPhase({ position: [-6.5, -1.4, -6], scale: 5.2, color: "#fff9f4", opacity: 0.55, driftSpeed: 0.03, driftAmount: 0.3 }, 0.2),
  withPhase({ position: [-3.2, -1.9, -7.5], scale: 4.4, color: "#fdf1f6", opacity: 0.5, driftSpeed: 0.025, driftAmount: 0.25 }, 1.7),
  withPhase({ position: [6.8, -1.6, -6.5], scale: 5.6, color: "#fff8f2", opacity: 0.55, driftSpeed: 0.028, driftAmount: 0.3 }, 3.1),
  withPhase({ position: [3.6, -2, -8], scale: 4.8, color: "#f6ecfa", opacity: 0.48, driftSpeed: 0.022, driftAmount: 0.22 }, 4.4),
  withPhase({ position: [0.4, -2.3, -9.5], scale: 6, color: "#faf3f8", opacity: 0.42, driftSpeed: 0.02, driftAmount: 0.2 }, 5.6),
  withPhase({ position: [-5.5, 3.4, -10], scale: 3.2, color: "#ffffff", opacity: 0.32, driftSpeed: 0.05, driftAmount: 0.4 }, 0.9),
  withPhase({ position: [5.2, 3.8, -11], scale: 2.8, color: "#fff5fb", opacity: 0.28, driftSpeed: 0.045, driftAmount: 0.35 }, 2.3),
  withPhase({ position: [0, 4.6, -12], scale: 3.6, color: "#f9f2ff", opacity: 0.24, driftSpeed: 0.04, driftAmount: 0.3 }, 3.8),
];

export function CloudField({ reducedMotion }: CloudFieldProps) {
  const texture = useMemo(() => getCloudPuffTexture(), []);
  const spriteRefs = useRef<Array<THREE.Sprite | null>>([]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const elapsed = clock.elapsedTime;
    for (let i = 0; i < PUFFS.length; i++) {
      const sprite = spriteRefs.current[i];
      const cfg = PUFFS[i];
      if (!sprite) continue;
      const t = elapsed * cfg.driftSpeed + cfg.phase;
      sprite.position.x = cfg.position[0] + Math.sin(t) * cfg.driftAmount;
      sprite.position.y = cfg.position[1] + Math.cos(t * 0.7) * cfg.driftAmount * 0.4;
    }
  });

  if (!texture) return null;

  return (
    <group>
      {PUFFS.map((cfg, i) => (
        <sprite
          key={i}
          ref={(el) => {
            spriteRefs.current[i] = el;
          }}
          position={cfg.position}
          scale={[cfg.scale, cfg.scale * 0.62, 1]}
        >
          <spriteMaterial
            map={texture}
            color={cfg.color}
            transparent
            opacity={cfg.opacity}
            depthWrite={false}
            fog
          />
        </sprite>
      ))}
    </group>
  );
}
