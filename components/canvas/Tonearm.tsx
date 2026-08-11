"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";
import { useIntroStore } from "@/store/intro-store";

type TonearmProps = {
  reducedMotion: boolean;
};

export function Tonearm({ reducedMotion }: TonearmProps) {
  const pivotRef = useRef<THREE.Group>(null);
  const phase = useIntroStore((s) => s.phase);
  const isCtaHovered = useIntroStore((s) => s.isCtaHovered);

  const chromeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.chrome,
        metalness: 1,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    [],
  );

  const darkChromeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.chromeDark,
        metalness: 0.95,
        roughness: 0.25,
        clearcoat: 0.8,
      }),
    [],
  );

  useFrame((_, delta) => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    let targetY = 0.35;
    let targetLift = 0.22;

    if (phase === "hovering" || isCtaHovered) {
      targetY = 0.22;
      targetLift = 0.16;
    }

    if (phase === "dropping" || phase === "transitioning" || phase === "ready") {
      targetY = -0.18;
      targetLift = 0.02;
    }

    if (reducedMotion) {
      pivot.rotation.y = targetY;
      pivot.position.y = 0.55 + targetLift;
      return;
    }

    pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, targetY, 3.2, delta);
    pivot.position.y = THREE.MathUtils.damp(
      pivot.position.y,
      0.55 + targetLift,
      3.5,
      delta,
    );
  });

  return (
    <group position={[1.55, 0.55, 0.15]} rotation={[0, 0.35, 0]}>
      <mesh castShadow material={chromeMaterial}>
        <cylinderGeometry args={[0.14, 0.18, 0.12, 32]} />
      </mesh>
      <mesh position={[0, 0.1, 0]} material={chromeMaterial}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 24]} />
      </mesh>

      <group ref={pivotRef} position={[0, 0.77, 0]}>
        <mesh
          position={[-0.85, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
          material={chromeMaterial}
        >
          <cylinderGeometry args={[0.035, 0.028, 1.7, 16]} />
        </mesh>

        <mesh position={[0.28, 0, 0]} material={chromeMaterial}>
          <boxGeometry args={[0.22, 0.1, 0.1]} />
        </mesh>

        <mesh position={[-1.68, -0.02, 0]} castShadow material={darkChromeMaterial}>
          <boxGeometry args={[0.22, 0.05, 0.12]} />
        </mesh>

        <mesh position={[-1.78, -0.08, 0]}>
          <coneGeometry args={[0.015, 0.08, 8]} />
          <meshStandardMaterial
            color={colors.amber}
            emissive={colors.amber}
            emissiveIntensity={0.35}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}
