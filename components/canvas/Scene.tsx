"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VinylRecord } from "@/components/canvas/VinylRecord";
import { Tonearm } from "@/components/canvas/Tonearm";
import { colors } from "@/lib/colors";
import { useIntroStore } from "@/store/intro-store";

type SceneProps = {
  parallax: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

const IDLE_CAMERA = new THREE.Vector3(0, 2.05, 3.35);
const DROP_CAMERA = new THREE.Vector3(0, 1.15, 1.55);
const READY_CAMERA = new THREE.Vector3(0, 1.8, 4.2);
const TRANSITION_CAMERA = DROP_CAMERA.clone().lerp(READY_CAMERA, 0.35);

export function Scene({ parallax, reducedMotion }: SceneProps) {
  const phase = useIntroStore((s) => s.phase);
  const isCtaHovered = useIntroStore((s) => s.isCtaHovered);
  const setPhase = useIntroStore((s) => s.setPhase);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const dropElapsed = useRef(0);

  useFrame((state, delta) => {
    const { camera } = state;
    const hoverBoost = isCtaHovered ? 1.35 : 1;

    if (keyLight.current) {
      const target = 2.4 * hoverBoost;
      keyLight.current.intensity = THREE.MathUtils.damp(
        keyLight.current.intensity,
        target,
        4,
        delta,
      );
    }

    if (rimLight.current) {
      const target = (isCtaHovered ? 3.2 : 1.8) * (phase === "dropping" ? 1.4 : 1);
      rimLight.current.intensity = THREE.MathUtils.damp(
        rimLight.current.intensity,
        target,
        4,
        delta,
      );
    }

    let camTarget = IDLE_CAMERA;
    if (phase === "dropping") camTarget = DROP_CAMERA;
    if (phase === "transitioning") camTarget = TRANSITION_CAMERA;
    if (phase === "ready") camTarget = READY_CAMERA;

    if (reducedMotion) {
      camera.position.copy(camTarget);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, camTarget.x, 1.8, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camTarget.y, 1.8, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, camTarget.z, 1.8, delta);
      camera.lookAt(0, 0, 0);
    }

    if (phase === "dropping") {
      dropElapsed.current += delta;
      const threshold = reducedMotion ? 0.05 : 2.4;
      if (dropElapsed.current >= threshold) {
        dropElapsed.current = 0;
        setPhase("transitioning");
      }
    } else if (phase === "transitioning") {
      dropElapsed.current += delta;
      const threshold = reducedMotion ? 0.05 : 1.6;
      if (dropElapsed.current >= threshold) {
        dropElapsed.current = 0;
        setPhase("ready");
      }
    } else {
      dropElapsed.current = 0;
    }
  });

  return (
    <>
      <color attach="background" args={[colors.nearBlack]} />
      <fog attach="fog" args={[colors.nearBlack, 6, 14]} />

      <ambientLight intensity={0.18} color="#1a1210" />
      <directionalLight
        ref={keyLight}
        position={[3.5, 5, 2]}
        intensity={2.4}
        color={colors.amber}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2.5, 2, -2]} intensity={0.55} color="#4a2030" />
      <pointLight
        ref={rimLight}
        position={[-1.5, 0.8, 2.2]}
        intensity={1.8}
        color={colors.cherryBright}
        distance={8}
        decay={2}
      />
      <spotLight
        position={[0, 4.5, 0]}
        angle={0.45}
        penumbra={0.7}
        intensity={1.1}
        color={colors.amberSoft}
        castShadow
      />

      {/* Platter base suggestion */}
      <mesh position={[0, -0.22, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial
          color="#080808"
          roughness={0.85}
          metalness={0.25}
        />
      </mesh>

      <VinylRecord parallax={parallax} reducedMotion={reducedMotion} />
      <Tonearm reducedMotion={reducedMotion} />
    </>
  );
}
