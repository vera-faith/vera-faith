"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";

type BubbleDriftProps = {
  reducedMotion: boolean;
};

type BubbleSeed = {
  position: THREE.Vector3;
  baseScale: number;
  driftSpeed: number;
  driftAmount: number;
  phase: number;
  spinSpeed: number;
};

const BUBBLE_SEEDS: BubbleSeed[] = [
  { position: new THREE.Vector3(-4.6, 1.8, -5.4), baseScale: 0.36, driftSpeed: 0.2, driftAmount: 0.3, phase: 0.4, spinSpeed: 0.12 },
  { position: new THREE.Vector3(5.0, 1.0, -5.8), baseScale: 0.27, driftSpeed: 0.18, driftAmount: 0.26, phase: 1.6, spinSpeed: 0.16 },
  { position: new THREE.Vector3(-3.8, -0.8, -6.2), baseScale: 0.42, driftSpeed: 0.15, driftAmount: 0.28, phase: 2.7, spinSpeed: 0.09 },
  { position: new THREE.Vector3(4.2, 2.6, -6.6), baseScale: 0.22, driftSpeed: 0.24, driftAmount: 0.32, phase: 3.5, spinSpeed: 0.2 },
  { position: new THREE.Vector3(-5.8, 0.3, -7.2), baseScale: 0.3, driftSpeed: 0.17, driftAmount: 0.24, phase: 4.3, spinSpeed: 0.1 },
  { position: new THREE.Vector3(2.8, -1.3, -6.4), baseScale: 0.3, driftSpeed: 0.16, driftAmount: 0.24, phase: 5.1, spinSpeed: 0.08 },
  { position: new THREE.Vector3(-1.6, 3.6, -8), baseScale: 0.19, driftSpeed: 0.25, driftAmount: 0.36, phase: 1.1, spinSpeed: 0.22 },
];

const TINTS = ["#f6dfe8", "#e4ecfb", "#f0e4f8", "#fdf1e0", "#e8f4ee"];

export function BubbleDrift({ reducedMotion }: BubbleDriftProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dummyColor = useMemo(() => new THREE.Color(), []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.pearl,
        roughness: 0.06,
        metalness: 0,
        transparent: true,
        opacity: 0.5,
        iridescence: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        transmission: 0.4,
        thickness: 0.4,
        envMapIntensity: 1.4,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const elapsed = reducedMotion ? 0 : clock.elapsedTime;

    for (let i = 0; i < BUBBLE_SEEDS.length; i++) {
      const seed = BUBBLE_SEEDS[i];
      const t = elapsed * seed.driftSpeed + seed.phase;
      dummy.position.set(
        seed.position.x + Math.sin(t) * seed.driftAmount,
        seed.position.y + Math.cos(t * 0.8) * seed.driftAmount * 0.6,
        seed.position.z + Math.sin(t * 0.5) * seed.driftAmount * 0.4,
      );
      dummy.rotation.set(elapsed * seed.spinSpeed, elapsed * seed.spinSpeed * 0.7, 0);
      dummy.scale.setScalar(seed.baseScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  function assignColors(mesh: THREE.InstancedMesh | null) {
    if (!mesh) return;
    for (let i = 0; i < BUBBLE_SEEDS.length; i++) {
      dummyColor.set(TINTS[i % TINTS.length]);
      mesh.setColorAt(i, dummyColor);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  return (
    <instancedMesh
      ref={(mesh) => {
        meshRef.current = mesh;
        assignColors(mesh);
      }}
      args={[undefined, undefined, BUBBLE_SEEDS.length]}
      material={material}
    >
      <sphereGeometry args={[1, 24, 24]} />
    </instancedMesh>
  );
}
