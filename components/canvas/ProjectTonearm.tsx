"use client";

import { useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";
import { useExperienceStore } from "@/store/experience-store";

type ProjectTonearmProps = {
  reducedMotion: boolean;
  visible: boolean;
};

/**
 * Lives inside the same local coordinate space as the vinyl disc (both are
 * nested under FocusStage's sleeve-anchored group), so the arm always reads
 * as reaching over the actual record rather than floating as a disconnected
 * prop elsewhere in the scene.
 */
const BASE_POSITION = new THREE.Vector3(1.02, 0.02, 0.16);
const SLIDE_IN_OFFSET = new THREE.Vector3(0.5, 0.12, 0);

export function ProjectTonearm({ reducedMotion, visible }: ProjectTonearmProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const phase = useExperienceStore((s) => s.phase);
  const isTonearmHovered = useExperienceStore((s) => s.isTonearmHovered);
  const setTonearmHovered = useExperienceStore((s) => s.setTonearmHovered);
  const dropNeedle = useExperienceStore((s) => s.dropNeedle);
  const bounce = useRef(0);
  const presence = useRef(0);

  const chrome = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.champagne,
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.6,
      }),
    [],
  );

  const headshellMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.chrome,
        metalness: 0.85,
        roughness: 0.22,
        envMapIntensity: 1.5,
      }),
    [],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    const pivot = pivotRef.current;
    if (!group || !pivot) return;

    const targetPresence = visible ? 1 : 0;
    presence.current = reducedMotion
      ? targetPresence
      : THREE.MathUtils.damp(presence.current, targetPresence, 3.6, delta);
    group.visible = presence.current > 0.01;

    const settle = 1 - presence.current;
    group.position.set(
      BASE_POSITION.x + SLIDE_IN_OFFSET.x * settle,
      BASE_POSITION.y + SLIDE_IN_OFFSET.y * settle,
      BASE_POSITION.z,
    );
    group.scale.setScalar(0.6 + 0.4 * presence.current);

    let targetAngle = 0.62;
    let targetLift = 0.09;

    if (phase === "awaitingNeedle") {
      targetAngle = isTonearmHovered ? 0.3 : 0.48;
      targetLift = isTonearmHovered ? 0.03 : 0.075;
    }

    if (phase === "playing") {
      targetAngle = 0.04;
      targetLift = 0.006;
      if (bounce.current < 1) {
        bounce.current = Math.min(1, bounce.current + delta * 2.5);
      }
    } else {
      bounce.current = 0;
    }

    if (phase === "returning") {
      targetAngle = 0.62;
      targetLift = 0.1;
    }

    if (reducedMotion) {
      pivot.rotation.y = targetAngle;
      pivot.position.y = targetLift;
    } else {
      pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, targetAngle, 3.2, delta);
      const bounceOffset =
        phase === "playing" && bounce.current < 1
          ? Math.sin(bounce.current * Math.PI) * 0.018
          : 0;
      pivot.position.y = THREE.MathUtils.damp(
        pivot.position.y,
        targetLift + bounceOffset,
        4,
        delta,
      );
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    dropNeedle();
  }

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (phase === "awaitingNeedle") setTonearmHovered(true);
  }

  function handlePointerOut() {
    setTonearmHovered(false);
  }

  return (
    <group ref={groupRef} rotation={[0, -0.12, 0]}>
      {/* Base plinth */}
      <mesh material={chrome} castShadow>
        <cylinderGeometry args={[0.095, 0.115, 0.045, 28]} />
      </mesh>
      <mesh position={[0, 0.045, 0]} material={chrome}>
        <cylinderGeometry args={[0.034, 0.034, 0.06, 16]} />
      </mesh>

      <group ref={pivotRef} position={[0, 0.06, 0]}>
        {/* Counterweight */}
        <mesh position={[0.3, 0, 0]} material={chrome} castShadow>
          <sphereGeometry args={[0.058, 20, 20]} />
        </mesh>

        {/* Tapered arm, thick near the pivot, thin near the headshell */}
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={chrome} castShadow>
          <cylinderGeometry args={[0.017, 0.03, 0.58, 16]} />
        </mesh>
        <mesh
          position={[-0.56, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={chrome}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <cylinderGeometry args={[0.011, 0.017, 0.42, 16]} />
        </mesh>

        {/* Headshell */}
        <mesh
          position={[-0.78, -0.012, 0]}
          material={headshellMaterial}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          castShadow
        >
          <boxGeometry args={[0.11, 0.05, 0.075]} />
        </mesh>

        {/* Needle, flush under the headshell tip */}
        <mesh position={[-0.815, -0.05, 0]} onClick={handleClick}>
          <coneGeometry args={[0.01, 0.05, 10]} />
          <meshStandardMaterial
            color={isTonearmHovered ? "#fff4d8" : colors.champagne}
            emissive={isTonearmHovered ? "#ffd9a8" : "#000000"}
            emissiveIntensity={isTonearmHovered ? 0.5 : 0}
          />
        </mesh>
      </group>
    </group>
  );
}
