"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "@/components/canvas/Scene";
import { colors } from "@/lib/colors";

type IntroCanvasProps = {
  parallax: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

export default function IntroCanvas({
  parallax,
  reducedMotion,
}: IntroCanvasProps) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: [0, 2.05, 3.35], fov: 35, near: 0.1, far: 40 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(colors.nearBlack, 1);
      }}
    >
      <Scene parallax={parallax} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
