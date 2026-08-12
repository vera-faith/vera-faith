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
  driftPx?: number;
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

/** Glassy anime flora on the shared pond plane — reflections, waterline,
 * contact depth, soft aura, riding one unified current. */
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
    loadKeyedSprite(src, { tolerance: 32, feather: 12 }).then((matted) => {
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

  const bobAmp = kind === "baby" ? 0.9 : kind === "lotus" ? 1 : 0.8;
  const rockAmp = kind === "baby" ? 3.8 : kind === "lotus" ? 2.6 : 1.5;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);

  const driftX = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.2) * driftPx;
    return current + Math.sin(t * 0.55 + phase) * 2.6;
  });
  const driftY = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.2) * driftPx * 0.42;
    return current + Math.cos(t * 0.48 + phase) * 3.1 * bobAmp;
  });
  const sway = useTransform(
    flowTime,
    (t) =>
      rotateDeg +
      Math.sin(t * 0.2) * 1.5 +
      Math.sin(t * 0.45 + phase) * (kind === "pad" ? 1.5 : 2.4),
  );
  const rock = useTransform(flowTime, (t) => Math.sin(t * 0.58 + phase) * rockAmp);
  const stretchX = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.5 + phase * 0.4) * (kind === "lotus" ? 0.02 : 0.012),
  );
  const stretchY = useTransform(
    flowTime,
    (t) => 1 + Math.cos(t * 0.46 + phase * 0.9) * (kind === "lotus" ? 0.016 : 0.01),
  );
  // Reflection warps with the current
  const reflectSkew = useTransform(flowTime, (t) => Math.sin(t * 0.35 + phase) * 8);
  const reflectX = useTransform(flowTime, (t) => Math.sin(t * 0.2) * 4 + Math.sin(t * 0.7 + phase) * 2);
  const reflectOp = useTransform(flowTime, (t) => 0.45 + Math.sin(t * 0.9 + phase) * 0.12);

  const reflectionColor =
    reflection === "pink" ? "rgba(235,130,165,0.65)" : "rgba(35,95,70,0.58)";
  const auraColor =
    reflection === "pink"
      ? "radial-gradient(ellipse at center, rgba(255,170,200,0.4) 0%, transparent 70%)"
      : "radial-gradient(ellipse at center, rgba(90,170,130,0.28) 0%, transparent 70%)";

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
        {/* Soft color aura in the water */}
        <div
          className="pointer-events-none absolute left-1/2 top-[70%] -translate-x-1/2 rounded-[100%] blur-[14px]"
          style={{ width: "90%", height: "42%", background: auraColor, opacity: 0.65 }}
        />

        {/* Distorted reflection — moves/skews with current */}
        <motion.div
          className="pointer-events-none absolute left-[52%] top-[88%] -translate-x-1/2 rounded-[100%] blur-[9px]"
          style={{
            width: "70%",
            height: "34%",
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 72%)`,
            opacity: reflectOp,
            x: reflectX,
            skewX: reflectSkew,
            scaleY: 0.9,
          }}
        />

        {/* Deep contact shadow — down-right of sun */}
        <div
          className="pointer-events-none absolute left-[56%] top-[68%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,5,4,0.62)_0%,_transparent_72%)]"
          style={{ width: "82%", height: "28%" }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            position: "relative",
            transform: flip ? "scaleX(-1)" : undefined,
            filter: `brightness(${brightness}) saturate(1.14) contrast(1.08)`,
          }}
        />

        {/* Neo-glass specular — stable upper-left sun kiss */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse 65% 55% at 16% 12%, rgba(255,250,235,0.5) 0%, rgba(255,230,200,0.12) 35%, transparent 58%)",
              opacity: 0.7,
            }}
          />
        )}

        {/* Inner petal / pad depth shading */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse at 55% 60%, transparent 40%, rgba(0,20,15,0.18) 100%)",
              opacity: 0.75,
            }}
          />
        )}

        {/* Waterline highlight clinging to the base */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "linear-gradient(to top, rgba(210,245,230,0.35) 0%, rgba(255,245,220,0.12) 14%, transparent 32%)",
              opacity: 0.85,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
