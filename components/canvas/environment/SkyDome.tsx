"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { colors } from "@/lib/colors";

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 colorTop;
  uniform vec3 colorMid;
  uniform vec3 colorHorizon;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
    float t = pow(max(h, 0.0), exponent);
    vec3 upper = mix(colorHorizon, colorMid, clamp(h * 1.6 + 0.35, 0.0, 1.0));
    vec3 sky = mix(upper, colorTop, t);
    gl_FragColor = vec4(sky, 1.0);
  }
`;

const LIGHT_BEAMS: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  color: string;
  opacity: number;
}> = [
  {
    position: [-3.2, 3.6, -11],
    rotation: [0, 0.3, 0.14],
    scale: [2.4, 11],
    color: "#fff6ee",
    opacity: 0.05,
  },
  {
    position: [3.8, 4.4, -12],
    rotation: [0, -0.25, -0.1],
    scale: [2.1, 10],
    color: "#fbe6f0",
    opacity: 0.045,
  },
];

let beamTexture: THREE.CanvasTexture | null = null;
function getBeamTexture() {
  if (beamTexture) return beamTexture;
  if (typeof document === "undefined") return null;

  const w = 128;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Horizontal falloff: bright in the center, fully transparent at the edges.
  const horizontal = ctx.createLinearGradient(0, 0, w, 0);
  horizontal.addColorStop(0, "rgba(255,255,255,0)");
  horizontal.addColorStop(0.5, "rgba(255,255,255,1)");
  horizontal.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, w, h);

  // Vertical falloff: fades out toward the bottom so the beam feels like it
  // is dissolving into haze rather than ending on a hard line.
  const vertical = ctx.createLinearGradient(0, 0, 0, h);
  vertical.addColorStop(0, "rgba(0,0,0,0)");
  vertical.addColorStop(0.7, "rgba(0,0,0,0.15)");
  vertical.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  beamTexture = texture;
  return texture;
}

export function SkyDome() {
  const uniforms = useMemo(
    () => ({
      colorTop: { value: new THREE.Color(colors.lavender) },
      colorMid: { value: new THREE.Color(colors.pearl) },
      colorHorizon: { value: new THREE.Color(colors.ivory) },
      offset: { value: 4 },
      exponent: { value: 0.75 },
    }),
    [],
  );

  const beamMap = useMemo(() => getBeamTexture(), []);

  return (
    <group>
      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[28, 32, 24]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
        />
      </mesh>

      {beamMap &&
        LIGHT_BEAMS.map((beam, i) => (
          <mesh key={i} position={beam.position} rotation={beam.rotation}>
            <planeGeometry args={beam.scale} />
            <meshBasicMaterial
              map={beamMap}
              color={beam.color}
              transparent
              opacity={beam.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              fog={false}
            />
          </mesh>
        ))}
    </group>
  );
}
