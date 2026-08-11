"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";
import { useExperienceStore } from "@/store/experience-store";
import type { Project } from "@/data/projects";

type VinylDiscProps = {
  project: Project;
  reducedMotion: boolean;
  slideProgressRef: RefObject<number>;
};

const DISC_RADIUS = 0.56;
const HIDDEN_X = -0.02;
const REVEALED_X = 0.64;

export function VinylDisc({
  project,
  reducedMotion,
  slideProgressRef,
}: VinylDiscProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const isPlaying = useExperienceStore((s) => s.isPlaying);
  const phase = useExperienceStore((s) => s.phase);

  const grooves = useMemo(() => {
    const rings: number[] = [];
    for (let i = 0; i < 16; i++) rings.push(0.2 + i * 0.0415);
    return rings;
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const slideProgress = slideProgressRef.current ?? 0;
    const targetX = THREE.MathUtils.lerp(HIDDEN_X, REVEALED_X, slideProgress);
    const damp = reducedMotion ? 20 : 4.5;
    group.position.x = THREE.MathUtils.damp(group.position.x, targetX, damp, delta);
    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      slideProgress > 0.85 ? 0.09 : 0.026,
      damp,
      delta,
    );

    const shouldSpin = isPlaying && !reducedMotion && phase === "playing";

    if (shouldSpin) {
      spin.current += delta * 1.5;
    } else if (phase === "returning") {
      spin.current = THREE.MathUtils.damp(spin.current, 0, 2.5, delta);
    }

    group.rotation.y = spin.current;
  });

  return (
    <group ref={groupRef} position={[HIDDEN_X, 0, 0.026]}>
      <mesh castShadow>
        <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.025, 72]} />
        <meshPhysicalMaterial
          color={colors.vinyl}
          roughness={0.32}
          metalness={0.4}
          clearcoat={0.75}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {grooves.map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
          <ringGeometry args={[radius, radius + 0.008, 72]} />
          <meshStandardMaterial
            color={colors.groove}
            transparent
            opacity={0.5}
            roughness={0.7}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.012, 48]} />
        <meshPhysicalMaterial
          color={project.accentColor}
          roughness={0.35}
          metalness={0.25}
          clearcoat={0.6}
          iridescence={0.4}
          iridescenceIOR={1.25}
        />
      </mesh>

      <mesh position={[0, 0.024, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.018, 16]} />
        <meshStandardMaterial color="#120f16" />
      </mesh>
    </group>
  );
}
