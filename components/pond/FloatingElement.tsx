"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type MotionValue, useTransform } from "motion/react";
import { loadKeyedSprite } from "@/lib/chroma-key";

type FloatingElementProps = {
  src: string;
  leftPct: number;
  topPct: number;
  widthPx: number;
  rotateDeg?: number;
  flip?: boolean;
  /** Individual bob phase offset — shared current is the same for everyone */
  phase?: number;
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  influence?: number;
  kind?: "pad" | "lotus" | "baby";
  reflection?: "pink" | "green";
  brightness?: number;
};

/**
 * Flora on ONE water plane, riding the shared pond current.
 * Directional drift is identical for all floaters; only bob/sway phase differs.
 * Stable sun-kissed rim (no traveling sheen band).
 */
export function FloatingElement({
  src,
  leftPct,
  topPct,
  widthPx,
  rotateDeg = 0,
  flip = false,
  phase = 0,
  reducedMotion,
  flowTime,
  cursorX,
  cursorY,
  influence = 3,
  kind = "pad",
  reflection = "green",
  brightness = 1,
}: FloatingElementProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadKeyedSprite(src, { tolerance: 32, feather: 14 }).then((matted) => {
      if (cancelled || !canvasRef.current) return;
      const el = canvasRef.current;
      el.width = matted.width;
      el.height = matted.height;
      el.getContext("2d")?.drawImage(matted, 0, 0);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const bobScale = kind === "baby" ? 0.85 : kind === "lotus" ? 1 : 0.9;
  const swayAmp = kind === "pad" ? 1.8 : kind === "baby" ? 3.6 : 2.6;
  const flexAmp = kind === "pad" ? 0.014 : kind === "lotus" ? 0.02 : 0.016;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);

  // SHARED current vector (same phase for every plant) + tiny personal bob
  const driftX = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.22) * 26;
    const bob = Math.sin(t * 0.48 + phase) * 3.5 * bobScale;
    return current + bob;
  });
  const driftY = useTransform(flowTime, (t) => {
    const current = Math.cos(t * 0.22) * 11;
    const bob = Math.cos(t * 0.4 + phase * 1.2) * 2.2 * bobScale;
    return current + bob;
  });
  const sway = useTransform(
    flowTime,
    (t) => rotateDeg + Math.sin(t * 0.28 + phase * 0.6) * swayAmp,
  );
  const rock = useTransform(
    flowTime,
    (t) => Math.sin(t * 0.55 + phase) * (kind === "baby" ? 3.2 : kind === "lotus" ? 2.2 : 1.3),
  );
  const stretchX = useTransform(flowTime, (t) => 1 + Math.sin(t * 0.45 + phase) * flexAmp);
  const stretchY = useTransform(flowTime, (t) => 1 + Math.cos(t * 0.42 + phase) * flexAmp * 0.85);

  const reflectionColor =
    reflection === "pink" ? "rgba(200,110,140,0.4)" : "rgba(25,70,50,0.42)";

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: widthPx,
        x: nudgeX,
        y: nudgeY,
        zIndex: 1,
      }}
    >
      <motion.div
        className="relative"
        style={
          reducedMotion || !mounted
            ? { rotate: rotateDeg }
            : {
                x: driftX,
                y: driftY,
                rotate: sway,
                skewX: rock,
                scaleX: stretchX,
                scaleY: stretchY,
              }
        }
      >
        {/* Depth: shadow cast away from upper-left sun (toward bottom-right) */}
        <div
          className="pointer-events-none absolute left-[54%] top-[70%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,6,5,0.5)_0%,_transparent_72%)] blur-[5px]"
          style={{ width: "78%", height: "28%" }}
        />

        {/* Soft distorted reflection in the water */}
        <div
          className="pointer-events-none absolute left-1/2 top-[88%] -translate-x-1/2 rounded-[100%] blur-[8px]"
          style={{
            width: "62%",
            height: "26%",
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 72%)`,
            opacity: 0.65,
            transform: "translateX(-50%) scaleY(0.9)",
          }}
        />

        {/* Contact darkening where plant meets water */}
        <div
          className="pointer-events-none absolute left-1/2 top-[66%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,10,8,0.45)_0%,_transparent_70%)]"
          style={{ width: "70%", height: "20%" }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            position: "relative",
            transform: flip ? "scaleX(-1)" : undefined,
            filter: `brightness(${brightness}) saturate(1.08) contrast(1.04)`,
          }}
        />

        {/* Stable sun kiss on the lit side — ellipse only, never a bounding-box wash */}
        <div
          className="pointer-events-none absolute left-[8%] top-[6%] h-[42%] w-[48%] rounded-[100%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,245,220,0.32) 0%, transparent 68%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
