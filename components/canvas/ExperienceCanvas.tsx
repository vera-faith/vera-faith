"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { ExperienceScene } from "@/components/canvas/ExperienceScene";
import { colors } from "@/lib/colors";

type ExperienceCanvasProps = {
  reducedMotion: boolean;
  simplified: boolean;
};

export default function ExperienceCanvas({
  reducedMotion,
  simplified,
}: ExperienceCanvasProps) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      shadows={simplified ? false : { type: THREE.PCFShadowMap }}
      camera={{
        position: [0, 0.55, 6.2],
        fov: simplified ? 52 : 38,
        near: 0.1,
        far: 60,
      }}
      dpr={simplified ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: simplified ? "low-power" : "high-performance",
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 0.95,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(colors.ivory, 1);
      }}
    >
      <PerformanceMonitor />
      <AdaptiveDpr />
      <Suspense fallback={null}>
        <ExperienceScene
          reducedMotion={reducedMotion}
          simplified={simplified}
        />
      </Suspense>
    </Canvas>
  );
}
