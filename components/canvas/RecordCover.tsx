"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Project } from "@/data/projects";
import { createCoverTexture, getCoverMaterialProps } from "@/lib/cover-texture";
import { getSheenGlintTexture } from "@/lib/soft-textures";
import { useExperienceStore } from "@/store/experience-store";

type RecordCoverProps = {
  project: Project;
  index: number;
  count: number;
  reducedMotion: boolean;
  scrollPositionRef: RefObject<number>;
  suppressClickRef: RefObject<boolean>;
  sleeveAnchorRef: RefObject<THREE.Object3D | null>;
};

const CENTER_SCALE = 1.42;
const ARC_STEP = 0.42;
const ARC_RADIUS = 3.4;
const ARC_DEPTH = 4.2;
const MAX_VISIBLE_OFFSET = 3.4;

let sharedSleeveGeometry: THREE.BufferGeometry | null = null;
function getSleeveGeometry() {
  if (!sharedSleeveGeometry) {
    sharedSleeveGeometry = new RoundedBoxGeometry(1.2, 1.2, 0.05, 3, 0.045);
  }
  return sharedSleeveGeometry;
}

export function RecordCover({
  project,
  index,
  count,
  reducedMotion,
  scrollPositionRef,
  suppressClickRef,
  sleeveAnchorRef,
}: RecordCoverProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const sheenRef = useRef<THREE.Mesh>(null);
  const spineRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const phase = useExperienceStore((s) => s.phase);
  const selectedId = useExperienceStore((s) => s.selectedId);
  const setHoveredId = useExperienceStore((s) => s.setHoveredId);
  const selectProject = useExperienceStore((s) => s.selectProject);

  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const texture = useMemo(
    () => createCoverTexture(project, maxAnisotropy),
    [project, maxAnisotropy],
  );
  const materialProps = useMemo(
    () => getCoverMaterialProps(project.coverTheme),
    [project.coverTheme],
  );
  const sleeveGeometry = useMemo(() => getSleeveGeometry(), []);
  const glintTexture = useMemo(() => getSheenGlintTexture(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const browsing = phase === "browsing";
    const isSelected = selectedId === project.id;

    let offset = index - scrollPositionRef.current;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;

    let targetX: number;
    let targetY: number;
    let targetZ: number;
    let targetRotY: number;
    let targetScale: number;
    let edgeFade = 1;

    if (browsing) {
      const a = offset * ARC_STEP;
      targetX = Math.sin(a) * ARC_RADIUS;
      targetY = -Math.abs(offset) * 0.055 + (hovered ? 0.16 : 0);
      targetZ = -(1 - Math.cos(a)) * ARC_DEPTH + (hovered ? 0.22 : 0);
      targetRotY = -a * 0.82;
      targetScale = CENTER_SCALE / (1 + Math.abs(offset) * 0.24);
      if (hovered) targetScale *= 1.05;
      // Dissolve smoothly into the haze near the visible edge instead of
      // popping in/out of existence at a hard cutoff.
      const fadeStart = MAX_VISIBLE_OFFSET - 0.7;
      const distance = Math.abs(offset);
      edgeFade =
        distance <= fadeStart
          ? 1
          : 1 - THREE.MathUtils.smoothstep(distance, fadeStart, MAX_VISIBLE_OFFSET);
      group.visible = edgeFade > 0.02;
    } else if (isSelected) {
      group.visible = true;
      if (phase === "selecting" || phase === "revealing") {
        targetX = -0.5;
        targetY = 0.08;
        targetZ = 1.35;
        targetRotY = 0.16;
        targetScale = 1.3;
      } else {
        targetX = -1.5;
        targetY = 0.32;
        targetZ = 1.05;
        targetRotY = 0.42;
        targetScale = 0.92;
      }
    } else {
      const dir = Math.sign(offset || 1);
      targetX = dir * 6.5 + offset * 0.4;
      targetY = 0.5;
      targetZ = -4.5;
      targetRotY = dir * -0.6;
      targetScale = 0.3;
      group.visible = true;
    }

    const damp = reducedMotion ? 18 : browsing ? 6.2 : 4.4;
    group.position.x = THREE.MathUtils.damp(group.position.x, targetX, damp, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, targetY, damp, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, targetZ, damp, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotY, damp, delta);
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      hovered && browsing ? -0.08 : 0.05,
      damp,
      delta,
    );
    const nextScale = THREE.MathUtils.damp(group.scale.x, targetScale, damp, delta);
    group.scale.setScalar(nextScale);

    if (isSelected && !browsing) {
      sleeveAnchorRef.current = group;
    }

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      const baseTarget = !browsing && !isSelected ? 0.22 : materialProps.opacity ?? 1;
      const targetOpacity = browsing ? baseTarget * edgeFade : baseTarget;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 6, delta);
      mat.transparent = true;
    }

    if (spineRef.current) {
      const spineMat = spineRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = browsing ? edgeFade : 1;
      spineMat.opacity = THREE.MathUtils.damp(spineMat.opacity, targetOpacity, 6, delta);
      spineMat.transparent = true;
    }

    if (sheenRef.current && browsing) {
      const sheenMat = sheenRef.current.material as THREE.MeshBasicMaterial;
      const nearCenter = 1 - Math.min(1, Math.abs(offset));
      sheenMat.opacity = hovered ? 0.1 : nearCenter * 0.045;
      sheenRef.current.position.x = state.pointer.x * 0.32 * nearCenter;
      sheenRef.current.position.y = state.pointer.y * 0.32 * nearCenter;
    }
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (phase !== "browsing") return;
    setHovered(true);
    setHoveredId(project.id);
  }

  function handlePointerOut() {
    setHovered(false);
    setHoveredId(null);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (suppressClickRef.current) return;
    if (phase !== "browsing") return;
    selectProject(project.id);
  }

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={sleeveGeometry}
        castShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshPhysicalMaterial map={texture} color="#ffffff" {...materialProps} />
      </mesh>

      {/* Spine edge */}
      <mesh ref={spineRef} position={[-0.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.05, 1.18]} />
        <meshStandardMaterial color={project.accentColor} roughness={0.5} />
      </mesh>

      <mesh ref={sheenRef} position={[0, 0, 0.032]}>
        <planeGeometry args={[0.55, 0.55]} />
        <meshBasicMaterial
          map={glintTexture}
          color="#ffffff"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
