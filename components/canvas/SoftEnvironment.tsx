"use client";

import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { colors } from "@/lib/colors";
import { SkyDome } from "@/components/canvas/environment/SkyDome";
import { CloudField } from "@/components/canvas/environment/CloudField";
import { BubbleDrift } from "@/components/canvas/environment/BubbleDrift";
import { PetalForms } from "@/components/canvas/environment/PetalForms";
import { HaloRings } from "@/components/canvas/environment/HaloRings";
import { Motes } from "@/components/canvas/environment/Motes";

type SoftEnvironmentProps = {
  reducedMotion: boolean;
  accent: string;
  simplified: boolean;
  intensity?: number;
};

export function SoftEnvironment({
  reducedMotion,
  accent,
  simplified,
  intensity = 1,
}: SoftEnvironmentProps) {
  return (
    <group>
      <fog attach="fog" args={[colors.pearl, 9, 24]} />
      <SkyDome />

      {/* One soft studio environment map so glassy/metal materials have
          something believable to reflect, built entirely from light forms
          (no network HDRI fetch). */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#fffaf3"
          position={[0, 5, 1]}
          scale={[10, 6, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={1.4}
          color={colors.blush}
          position={[-5, 1, 3]}
          scale={4}
        />
        <Lightformer
          form="circle"
          intensity={1.2}
          color={colors.lavender}
          position={[5, 1.5, 2]}
          scale={4}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color={colors.champagne}
          position={[0, -1, -4]}
          scale={[6, 4, 1]}
        />
      </Environment>

      <ambientLight intensity={0.65 * intensity} color="#fff8f2" />
      <directionalLight
        position={[3.5, 5.5, 3]}
        intensity={1.05 * intensity}
        color="#fff3ea"
        castShadow={!simplified}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[-2.5, 1.5, 2.5]}
        intensity={0.55 * intensity}
        color={accent}
        distance={10}
      />

      {!simplified && (
        <ContactShadows
          position={[0, -1.35, 0]}
          opacity={0.28}
          scale={9}
          blur={2.6}
          far={3}
          color={colors.ink}
        />
      )}

      <CloudField reducedMotion={reducedMotion} />
      <BubbleDrift reducedMotion={reducedMotion} />
      <PetalForms reducedMotion={reducedMotion} />
      {!simplified && <HaloRings reducedMotion={reducedMotion} />}
      {!simplified && <Motes reducedMotion={reducedMotion} />}
    </group>
  );
}
