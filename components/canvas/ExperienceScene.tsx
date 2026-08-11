"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { SoftEnvironment } from "@/components/canvas/SoftEnvironment";
import { CollectionCarousel } from "@/components/canvas/CollectionCarousel";
import { FocusStage } from "@/components/canvas/FocusStage";
import { getProjectById, projects } from "@/data/projects";
import { useExperienceStore } from "@/store/experience-store";
import { colors } from "@/lib/colors";

type ExperienceSceneProps = {
  reducedMotion: boolean;
  simplified: boolean;
};

const BROWSE_CAM = new THREE.Vector3(0, 0.55, 6.2);
const FOCUS_CAM = new THREE.Vector3(-0.55, 0.62, 6.1);
const BROWSE_LOOK = new THREE.Vector3(0, 0.12, 0);
const FOCUS_LOOK = new THREE.Vector3(-0.55, 0.28, 0.7);
const DOF_TARGET_BROWSE = new THREE.Vector3(0, 0.15, 0.4);
const DOF_TARGET_FOCUS = new THREE.Vector3(-0.55, 0.28, 0.9);

export function ExperienceScene({
  reducedMotion,
  simplified,
}: ExperienceSceneProps) {
  const phase = useExperienceStore((s) => s.phase);
  const activeIndex = useExperienceStore((s) => s.activeIndex);
  const selectedId = useExperienceStore((s) => s.selectedId);
  const project =
    (selectedId && getProjectById(selectedId)) || projects[activeIndex];
  const accent = project?.accentColor ?? colors.pink;
  const sleeveAnchorRef = useRef<THREE.Object3D | null>(null);

  useFrame((state, delta) => {
    const camera = state.camera;
    const browsing = phase === "browsing";
    const target = browsing ? BROWSE_CAM : FOCUS_CAM;

    if (reducedMotion) {
      camera.position.copy(target);
    } else {
      const parallaxX = browsing ? state.pointer.x * 0.16 : state.pointer.x * 0.05;
      const parallaxY = browsing ? state.pointer.y * 0.08 : state.pointer.y * 0.035;
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        target.x + parallaxX,
        3.2,
        delta,
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        target.y + parallaxY,
        3.2,
        delta,
      );
      camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 3.2, delta);
    }
    const look = browsing ? BROWSE_LOOK : FOCUS_LOOK;
    camera.lookAt(look);
  });

  return (
    <>
      <SoftEnvironment
        reducedMotion={reducedMotion}
        accent={accent}
        simplified={simplified}
        intensity={simplified ? 0.9 : 1}
      />
      <CollectionCarousel
        reducedMotion={reducedMotion}
        sleeveAnchorRef={sleeveAnchorRef}
      />
      <FocusStage reducedMotion={reducedMotion} sleeveAnchorRef={sleeveAnchorRef} />

      {!simplified && (
        <EffectComposer multisampling={0}>
          <DepthOfField
            target={phase === "browsing" ? DOF_TARGET_BROWSE : DOF_TARGET_FOCUS}
            focalLength={0.012}
            bokehScale={1.6}
            height={480}
          />
          <Bloom
            mipmapBlur
            luminanceThreshold={0.94}
            luminanceSmoothing={0.2}
            intensity={0.22}
          />
          <Vignette eskil={false} offset={0.24} darkness={0.42} />
          <Noise opacity={0.012} />
        </EffectComposer>
      )}
    </>
  );
}
