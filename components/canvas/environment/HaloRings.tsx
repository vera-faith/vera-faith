"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";
import { getHaloRingTexture } from "@/lib/soft-textures";

type HaloRingsProps = {
  reducedMotion: boolean;
};

type RingConfig = {
  position: [number, number, number];
  scale: number;
  color: string;
  driftSpeed: number;
  phase: number;
  spinSpeed: number;
};

const RINGS: RingConfig[] = [
  {
    position: [4.4, 2.6, -8.5],
    scale: 4.2,
    color: colors.champagne,
    driftSpeed: 0.03,
    phase: 0.8,
    spinSpeed: 0.02,
  },
  {
    position: [-5.2, 1.4, -9.2],
    scale: 3.2,
    color: colors.lavender,
    driftSpeed: 0.035,
    phase: 3.1,
    spinSpeed: -0.018,
  },
];

/** A couple of softly glowing rings drifting in the far background — the
 * "soft ring / halo" element from the environment mood board. */
export function HaloRings({ reducedMotion }: HaloRingsProps) {
  const spriteRefs = useRef<Array<THREE.Sprite | null>>([]);
  const textures = useMemo(() => RINGS.map((ring) => getHaloRingTexture(ring.color)), []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const elapsed = clock.elapsedTime;
    for (let i = 0; i < RINGS.length; i++) {
      const sprite = spriteRefs.current[i];
      const cfg = RINGS[i];
      if (!sprite) continue;
      const t = elapsed * cfg.driftSpeed + cfg.phase;
      sprite.position.x = cfg.position[0] + Math.sin(t) * 0.3;
      sprite.position.y = cfg.position[1] + Math.cos(t * 0.7) * 0.22;
      sprite.material.rotation = elapsed * cfg.spinSpeed;
    }
  });

  return (
    <group>
      {RINGS.map((cfg, i) => {
        const texture = textures[i];
        if (!texture) return null;
        return (
          <sprite
            key={i}
            ref={(el) => {
              spriteRefs.current[i] = el;
            }}
            position={cfg.position}
            scale={[cfg.scale, cfg.scale, 1]}
          >
            <spriteMaterial
              map={texture}
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog
            />
          </sprite>
        );
      })}
    </group>
  );
}
