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
  freqScale?: number;
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

/** Crisp anime flora floating ON the water — opaque, clear, shared current. */
export function FloatingElement({
  src,
  leftPct,
  topPct,
  widthPx,
  rotateDeg = 0,
  flip = false,
  driftPx = 12,
  freqScale = 1,
  phase = 0,
  reducedMotion,
  flowTime,
  cursorX,
  cursorY,
  influence = 4,
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
    loadKeyedSprite(src, { tolerance: 32, feather: 16 }).then((matted) => {
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

  const bobAmp = kind === "baby" ? 0.75 : kind === "lotus" ? 1 : 0.85;
  const rockAmp = kind === "baby" ? 4.5 : kind === "lotus" ? 2.8 : 1.6;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);
  const driftX = useTransform(flowTime, (t) => Math.sin(t * 0.36 * freqScale + phase) * driftPx);
  const driftY = useTransform(
    flowTime,
    (t) => Math.cos(t * 0.26 * freqScale + phase * 1.3) * driftPx * 0.5 * bobAmp,
  );
  const sway = useTransform(
    flowTime,
    (t) => rotateDeg + Math.sin(t * 0.3 * freqScale + phase * 0.7) * (kind === "pad" ? 2.2 : 3.4),
  );
  const rock = useTransform(
    flowTime,
    (t) => Math.sin(t * 0.62 * freqScale + phase) * rockAmp,
  );
  const stretchX = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.5 * freqScale + phase * 0.4) * (kind === "lotus" ? 0.022 : 0.012),
  );
  const stretchY = useTransform(
    flowTime,
    (t) => 1 + Math.cos(t * 0.46 * freqScale + phase * 0.9) * (kind === "lotus" ? 0.018 : 0.01),
  );
  const sheenX = useTransform(flowTime, (t) => `${((t * 14 + phase * 35) % 160) - 40}%`);

  const reflectionColor =
    reflection === "pink" ? "rgba(220,120,150,0.35)" : "rgba(35,85,55,0.38)";

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
        <div
          className="pointer-events-none absolute left-1/2 top-[82%] -translate-x-1/2 rounded-[100%] blur-[7px]"
          style={{
            width: "65%",
            height: "24%",
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 70%)`,
            opacity: 0.6,
          }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,8,6,0.38)_0%,_transparent_70%)]"
          style={{ width: "72%", height: "22%" }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            position: "relative",
            transform: flip ? "scaleX(-1)" : undefined,
            filter: `brightness(${brightness}) saturate(1.1) contrast(1.05)`,
          }}
        />

        {!reducedMotion && maskUrl && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ ...silhouetteMask, opacity: 0.4 }}
          >
            <motion.div
              className="absolute inset-y-[-10%] w-[30%] bg-[linear-gradient(105deg,transparent_0%,rgba(255,245,220,0.55)_50%,transparent_100%)]"
              style={{ left: sheenX }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
