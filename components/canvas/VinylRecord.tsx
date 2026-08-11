"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/colors";
import { useIntroStore } from "@/store/intro-store";

type VinylRecordProps = {
  parallax: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

const GROOVE_COUNT = 28;

export function VinylRecord({ parallax, reducedMotion }: VinylRecordProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef(0);
  const phase = useIntroStore((s) => s.phase);
  const isCtaHovered = useIntroStore((s) => s.isCtaHovered);

  const grooves = useMemo(() => {
    const rings: number[] = [];
    for (let i = 0; i < GROOVE_COUNT; i++) {
      const t = i / (GROOVE_COUNT - 1);
      rings.push(0.42 + t * 1.28);
    }
    return rings;
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const spinning =
      !reducedMotion &&
      (phase === "dropping" || phase === "transitioning" || phase === "ready");

    if (spinning) {
      const speed = phase === "ready" ? 1.2 : phase === "transitioning" ? 2.4 : 1.8;
      spinRef.current += delta * speed;
      group.rotation.y = spinRef.current;
    }

    const boost = isCtaHovered ? 1.55 : 1;
    const px = parallax.current?.x ?? 0;
    const py = parallax.current?.y ?? 0;
    const targetRotX = -0.55 + py * 0.12 * boost;
    const targetRotZ = px * 0.14 * boost;

    if (reducedMotion) {
      group.rotation.x = -0.55;
      group.rotation.z = 0;
      return;
    }

    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetRotX, 4, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, targetRotZ, 4, delta);
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {/* Main disc body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.75, 1.75, 0.045, 96]} />
        <meshPhysicalMaterial
          color={colors.vinyl}
          roughness={0.35}
          metalness={0.55}
          clearcoat={0.65}
          clearcoatRoughness={0.25}
        />
      </mesh>

      {/* Outer rim highlight */}
      <mesh position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.68, 1.75, 96]} />
        <meshStandardMaterial
          color={colors.chromeDark}
          roughness={0.25}
          metalness={0.85}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Concentric grooves */}
      {grooves.map((radius) => (
        <mesh
          key={radius}
          position={[0, 0.024, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.012, 96]} />
          <meshStandardMaterial
            color={colors.groove}
            roughness={0.7}
            metalness={0.2}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}

      {/* Label disc */}
      <mesh position={[0, 0.028, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 64]} />
        <meshPhysicalMaterial
          color={colors.label}
          roughness={0.55}
          metalness={0.15}
          clearcoat={0.3}
        />
      </mesh>

      {/* Label ring accent */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.36, 64]} />
        <meshStandardMaterial
          color={colors.cherry}
          roughness={0.4}
          metalness={0.35}
          emissive={colors.cherry}
          emissiveIntensity={isCtaHovered ? 0.45 : 0.18}
        />
      </mesh>

      {/* Spindle hole */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
        <meshStandardMaterial color="#020202" roughness={0.9} metalness={0} />
      </mesh>

      {/* Center label type plane */}
      <LabelMark />
    </group>
  );
}

function LabelMark() {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = colors.label;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = colors.cherryBright;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colors.cream;
    ctx.font = "600 42px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VERA FAITH", 256, 230);

    ctx.font = "400 22px Helvetica, Arial, sans-serif";
    ctx.fillStyle = colors.amber;
    ctx.fillText("SELECTED WORKS", 256, 280);

    ctx.fillStyle = colors.chromeDark;
    ctx.font = "400 18px Helvetica, Arial, sans-serif";
    ctx.fillText("2026", 256, 318);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (!texture) return null;

  return (
    <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.36, 64]} />
      <meshStandardMaterial map={texture} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}
