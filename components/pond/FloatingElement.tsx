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
  /** Amplitude of shared current drift (px) */
  driftPx?: number;
  /** Tiny local phase for bob only — current direction is shared */
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
 * Flora on the shared pond plane. Primary motion follows one pond current
 * (same direction/rhythm for every plant); local phase only adds gentle bob/sway.
 */
export function FloatingElement({
  src,
  leftPct,
  topPct,
  widthPx,
  rotateDeg = 0,
  flip = false,
  driftPx = 14,
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
  const [maskUrl, setMaskUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const maskUrlRef = useRef<string | null>(null);

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
      const ctx = el.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(matted, 0, 0);

      matted.toBlob((blob) => {
        if (cancelled || !blob) return;
        if (maskUrlRef.current) URL.revokeObjectURL(maskUrlRef.current);
        const url = URL.createObjectURL(blob);
        maskUrlRef.current = url;
        setMaskUrl(url);
      }, "image/png");
    });
    return () => {
      cancelled = true;
      if (maskUrlRef.current) {
        URL.revokeObjectURL(maskUrlRef.current);
        maskUrlRef.current = null;
      }
    };
  }, [src]);

  const bobAmp = kind === "baby" ? 0.85 : kind === "lotus" ? 1 : 0.75;
  const rockAmp = kind === "baby" ? 3.6 : kind === "lotus" ? 2.4 : 1.4;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);

  // Shared current axis (matches water pan: left + slightly up). Same phase for all.
  const driftX = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.2) * driftPx;
    const local = Math.sin(t * 0.55 + phase) * 2.4;
    return current + local;
  });
  const driftY = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.2) * driftPx * 0.42;
    const bob = Math.cos(t * 0.48 + phase) * 2.8 * bobAmp;
    return current + bob;
  });
  const sway = useTransform(
    flowTime,
    (t) => rotateDeg + Math.sin(t * 0.2) * 1.6 + Math.sin(t * 0.45 + phase) * (kind === "pad" ? 1.4 : 2.2),
  );
  const rock = useTransform(flowTime, (t) => Math.sin(t * 0.58 + phase) * rockAmp);
  const stretchX = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.5 + phase * 0.4) * (kind === "lotus" ? 0.018 : 0.01),
  );
  const stretchY = useTransform(
    flowTime,
    (t) => 1 + Math.cos(t * 0.46 + phase * 0.9) * (kind === "lotus" ? 0.014 : 0.008),
  );

  const reflectionColor =
    reflection === "pink" ? "rgba(210,110,140,0.4)" : "rgba(25,70,50,0.42)";

  const silhouetteMask = maskUrl
    ? {
        WebkitMaskImage: `url(${maskUrl})`,
        maskImage: `url(${maskUrl})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : undefined;

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
        {/* Reflection in the water — offset slightly with the light direction */}
        <div
          className="pointer-events-none absolute left-[52%] top-[86%] -translate-x-1/2 rounded-[100%] blur-[8px]"
          style={{
            width: "68%",
            height: "30%",
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 72%)`,
            opacity: 0.7,
          }}
        />

        {/* Contact shadow — opposite the sun (down-right) for depth */}
        <div
          className="pointer-events-none absolute left-[54%] top-[66%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,6,4,0.55)_0%,_transparent_72%)]"
          style={{ width: "78%", height: "26%" }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            position: "relative",
            transform: flip ? "scaleX(-1)" : undefined,
            filter: `brightness(${brightness}) saturate(1.12) contrast(1.06)`,
          }}
        />

        {/* Stable sun-kissed rim — FIXED upper-left, never sweeps */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse 70% 60% at 18% 12%, rgba(255,245,220,0.35) 0%, transparent 55%)",
              opacity: 0.55,
            }}
          />
        )}

        {/* Soft waterline highlight along the lower silhouette */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "linear-gradient(to top, rgba(180,220,200,0.22) 0%, transparent 28%)",
              opacity: 0.7,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
