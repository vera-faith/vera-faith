"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProjectById } from "@/data/projects";
import { VinylDisc } from "@/components/canvas/VinylDisc";
import { ProjectTonearm } from "@/components/canvas/ProjectTonearm";
import { useExperienceStore } from "@/store/experience-store";
import { usePhaseSequence } from "@/hooks/use-phase-sequence";

type FocusStageProps = {
  reducedMotion: boolean;
  sleeveAnchorRef: RefObject<THREE.Object3D | null>;
};

const REVEAL_DURATIONS = {
  selecting: 0.85,
  revealing: 1.05,
  returning: 1.4,
};

const worldPosition = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();
const worldScale = new THREE.Vector3();

export function FocusStage({ reducedMotion, sleeveAnchorRef }: FocusStageProps) {
  const phase = useExperienceStore((s) => s.phase);
  const selectedId = useExperienceStore((s) => s.selectedId);
  const advancePhase = useExperienceStore((s) => s.advancePhase);
  const finishReturn = useExperienceStore((s) => s.finishReturn);
  const slideRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const { tick, reset } = usePhaseSequence(REVEAL_DURATIONS);

  const project = selectedId ? getProjectById(selectedId) : null;

  useEffect(() => {
    if (phase === "selecting") slideRef.current = 0;
    if (phase === "browsing") reset();
  }, [phase, selectedId, reset]);

  useFrame((_, delta) => {
    if (!project) return;

    const dt = reducedMotion ? Math.min(delta, 1) : delta;

    if (phase === "selecting") {
      tick(dt, "selecting", () => advancePhase("revealing"));
    }

    if (phase === "revealing") {
      const progress = tick(dt, "revealing", () => advancePhase("awaitingNeedle"));
      slideRef.current = progress;
    }

    if (phase === "returning") {
      const progress = tick(dt, "returning", () => finishReturn());
      slideRef.current = 1 - progress;
    }

    const group = groupRef.current;
    const anchor = sleeveAnchorRef.current;
    if (group && anchor) {
      anchor.getWorldPosition(worldPosition);
      anchor.getWorldQuaternion(worldQuaternion);
      anchor.getWorldScale(worldScale);
      group.position.copy(worldPosition);
      group.quaternion.copy(worldQuaternion);
      group.scale.setScalar(worldScale.x);
    }
  });

  if (!project) return null;

  const tonearmVisible =
    phase === "revealing" ||
    phase === "awaitingNeedle" ||
    phase === "playing" ||
    phase === "returning";

  const showVinyl =
    phase === "revealing" ||
    phase === "awaitingNeedle" ||
    phase === "playing" ||
    phase === "returning";

  return (
    // Follows the selected sleeve's live world transform so the vinyl and
    // tonearm both read as physically attached to the actual sleeve rather
    // than disconnected props elsewhere in the scene.
    <group ref={groupRef}>
      {showVinyl && (
        <VinylDisc
          project={project}
          reducedMotion={reducedMotion}
          slideProgressRef={slideRef}
        />
      )}
      <ProjectTonearm reducedMotion={reducedMotion} visible={tonearmVisible} />
    </group>
  );
}
