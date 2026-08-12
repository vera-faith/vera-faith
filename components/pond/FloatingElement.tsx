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

/** Buoyant flora on the shared pond plane — petal sway, reflections, waterline. */
export function FloatingElement({
  src,
  leftPct,
  topPct,
  widthPx,
  rotateDeg = 0,
  flip = false,
  driftPx = 16,
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
  const bodyRef = useRef<HTMLCanvasElement>(null);
  const petalRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const maskUrlRef = useRef<string | null>(null);

  const usePetals = kind === "lotus" || kind === "baby";

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadKeyedSprite(src, { tolerance: 32, feather: 12 }).then((matted) => {
      if (cancelled) return;
      for (const ref of [bodyRef, petalRef]) {
        const el = ref.current;
        if (!el) continue;
        el.width = matted.width;
        el.height = matted.height;
        const ctx = el.getContext("2d");
        if (!ctx) continue;
        ctx.clearRect(0, 0, el.width, el.height);
        ctx.drawImage(matted, 0, 0);
      }
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

  const bobAmp = kind === "baby" ? 1 : kind === "lotus" ? 1.15 : 0.85;
  const rockAmp = kind === "baby" ? 4.2 : kind === "lotus" ? 3.2 : 1.8;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);

  const driftX = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.22) * driftPx;
    return current + Math.sin(t * 0.6 + phase) * 3.2;
  });
  const driftY = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.22) * driftPx * 0.45;
    return current + Math.cos(t * 0.52 + phase) * 3.8 * bobAmp;
  });
  const sway = useTransform(
    flowTime,
    (t) =>
      rotateDeg +
      Math.sin(t * 0.22) * 1.8 +
      Math.sin(t * 0.5 + phase) * (kind === "pad" ? 2 : 3.2),
  );
  const rock = useTransform(flowTime, (t) => Math.sin(t * 0.62 + phase) * rockAmp);
  const stretchX = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.55 + phase * 0.4) * (kind === "lotus" ? 0.028 : 0.014),
  );
  const stretchY = useTransform(
    flowTime,
    (t) => 1 + Math.cos(t * 0.5 + phase * 0.9) * (kind === "lotus" ? 0.022 : 0.012),
  );
  // Light flowy petal secondary motion
  const petalRock = useTransform(
    flowTime,
    (t) => Math.sin(t * 0.95 + phase * 1.6) * (kind === "baby" ? 5.5 : 4.2),
  );
  const petalStretch = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.85 + phase * 2) * (kind === "baby" ? 0.04 : 0.032),
  );
  const reflectSkew = useTransform(flowTime, (t) => Math.sin(t * 0.4 + phase) * 10);
  const reflectX = useTransform(flowTime, (t) => Math.sin(t * 0.22) * 5 + Math.sin(t * 0.75 + phase) * 2.5);
  const reflectOp = useTransform(flowTime, (t) => 0.5 + Math.sin(t * 0.95 + phase) * 0.14);

  const reflectionColor =
    reflection === "pink" ? "rgba(235,130,165,0.7)" : "rgba(35,95,70,0.6)";
  const auraColor =
    reflection === "pink"
      ? "radial-gradient(ellipse at center, rgba(255,170,200,0.42) 0%, transparent 70%)"
      : "radial-gradient(ellipse at center, rgba(90,170,130,0.3) 0%, transparent 70%)";

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

  const canvasStyle = {
    width: "100%",
    height: "auto",
    display: "block" as const,
    transform: flip ? "scaleX(-1)" : undefined,
    filter: `brightness(${brightness}) saturate(1.16) contrast(1.1)`,
  };

  const bodyClip = kind === "baby" ? "inset(40% 0 0 0)" : "inset(38% 0 0 0)";
  const petalClip = kind === "baby" ? "inset(0 6% 48% 6%)" : "inset(0 5% 45% 5%)";

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
        <div
          className="pointer-events-none absolute left-1/2 top-[70%] -translate-x-1/2 rounded-[100%] blur-[14px]"
          style={{ width: "90%", height: "42%", background: auraColor, opacity: 0.7 }}
        />

        <motion.div
          className="pointer-events-none absolute left-[52%] top-[88%] -translate-x-1/2 rounded-[100%] blur-[9px]"
          style={{
            width: "72%",
            height: "36%",
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 72%)`,
            opacity: reflectOp,
            x: reflectX,
            skewX: reflectSkew,
            scaleY: 0.92,
          }}
        />

        <div
          className="pointer-events-none absolute left-[56%] top-[68%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,5,4,0.65)_0%,_transparent_72%)]"
          style={{ width: "84%", height: "28%" }}
        />

        {reducedMotion || !usePetals ? (
          <canvas ref={bodyRef} style={canvasStyle} />
        ) : (
          <>
            <div className="relative" style={{ clipPath: bodyClip }}>
              <canvas ref={bodyRef} style={canvasStyle} />
            </div>
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                clipPath: petalClip,
                transformOrigin: "50% 30%",
                skewX: petalRock,
                scaleX: petalStretch,
              }}
            >
              <canvas ref={petalRef} style={canvasStyle} />
            </motion.div>
          </>
        )}

        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse 65% 55% at 16% 12%, rgba(255,250,235,0.48) 0%, rgba(255,230,200,0.1) 35%, transparent 58%)",
              opacity: 0.72,
            }}
          />
        )}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse at 55% 60%, transparent 40%, rgba(0,20,15,0.16) 100%)",
              opacity: 0.75,
            }}
          />
        )}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "linear-gradient(to top, rgba(210,245,230,0.38) 0%, rgba(255,245,220,0.14) 14%, transparent 32%)",
              opacity: 0.9,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
