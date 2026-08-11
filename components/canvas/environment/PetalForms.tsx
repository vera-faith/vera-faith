"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";
import { getPetalBloomTexture } from "@/lib/soft-textures";

type PetalFormsProps = {
  reducedMotion: boolean;
};

type BloomConfig = {
  position: [number, number, number];
  scale: number;
  petalColor: string;
  budColor: string;
  opacity: number;
  driftSpeed: number;
  phase: number;
};

const BLOOMS: BloomConfig[] = [
  {
    position: [-5.6, -1.2, -6.4],
    scale: 3.4,
    petalColor: colors.blush,
    budColor: colors.champagne,
    opacity: 0.4,
    driftSpeed: 0.04,
    phase: 0.4,
  },
  {
    position: [6.1, -0.1, -7.2],
    scale: 2.7,
    petalColor: colors.lavender,
    budColor: colors.champagne,
    opacity: 0.36,
    driftSpeed: 0.036,
    phase: 2.1,
  },
];

/**
 * Soft billboard flower blooms framing the lower/upper corners. Drawn as
 * canvas textures on sprites so they always read as flowers, unlike thin
 * 3D petal geometry which can silhouette oddly from certain angles.
 */
export function PetalForms({ reducedMotion }: PetalFormsProps) {
  const spriteRefs = useRef<Array<THREE.Sprite | null>>([]);
  const textures = useMemo(
    () => BLOOMS.map((bloom) => getPetalBloomTexture(bloom.petalColor, bloom.budColor)),
    [],
  );

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const elapsed = clock.elapsedTime;
    for (let i = 0; i < BLOOMS.length; i++) {
      const sprite = spriteRefs.current[i];
      const cfg = BLOOMS[i];
      if (!sprite) continue;
      const t = elapsed * cfg.driftSpeed + cfg.phase;
      sprite.position.x = cfg.position[0] + Math.sin(t) * 0.2;
      sprite.position.y = cfg.position[1] + Math.cos(t * 0.8) * 0.15;
      sprite.material.rotation = Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <group>
      {BLOOMS.map((cfg, i) => {
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
              opacity={cfg.opacity}
              depthWrite={false}
              fog
            />
          </sprite>
        );
      })}
    </group>
  );
}
