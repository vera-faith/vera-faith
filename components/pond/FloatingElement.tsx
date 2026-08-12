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

/** Flora seated in the pond plane — contact shadow, wet rim, distorted reflection. */
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
  const reflectRef = useRef<HTMLCanvasElement>(null);
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
    loadKeyedSprite(src, { tolerance: 34, feather: 16 }).then((matted) => {
      if (cancelled) return;
      for (const ref of [bodyRef, petalRef, reflectRef]) {
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

  // Babies sway more; pads tilt gently; lotuses hold weight
  const bobAmp = kind === "baby" ? 1.35 : kind === "lotus" ? 1.1 : 0.9;
  const rockAmp = kind === "baby" ? 6.5 : kind === "lotus" ? 3.4 : 2.4;
  const swayAmp = kind === "baby" ? 5.2 : kind === "lotus" ? 3.6 : 2.6;
  const petalAmp = kind === "baby" ? 7.5 : 4.8;
  // Mild foreshortening so plants sit on the same angled plane as the water
  const planeScaleY = 0.88 + (topPct / 100) * 0.08;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);

  // Shared down-right current + local bob — readable drift with the water
  const driftX = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.16 + phase * 0.05) * driftPx;
    const local = Math.sin(t * 0.48 + phase) * (kind === "baby" ? 3.6 : 2.2);
    return current + local;
  });
  const driftY = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.16 + phase * 0.05) * driftPx * 0.82;
    const bob = Math.cos(t * 0.52 + phase) * 3.4 * bobAmp;
    return current + bob;
  });
  const sway = useTransform(
    flowTime,
    (t) =>
      rotateDeg +
      Math.sin(t * 0.2) * 1.6 +
      Math.sin(t * 0.55 + phase) * swayAmp,
  );
  const rock = useTransform(flowTime, (t) => Math.sin(t * 0.68 + phase) * rockAmp);
  const stretchX = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.5 + phase * 0.4) * (kind === "baby" ? 0.036 : kind === "lotus" ? 0.026 : 0.016),
  );
  const stretchY = useTransform(
    flowTime,
    (t) =>
      planeScaleY *
      (1 + Math.cos(t * 0.46 + phase * 0.9) * (kind === "baby" ? 0.03 : kind === "lotus" ? 0.02 : 0.014)),
  );
  const petalRock = useTransform(
    flowTime,
    (t) => Math.sin(t * 1.05 + phase * 1.7) * petalAmp,
  );
  const petalStretch = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.9 + phase * 2) * (kind === "baby" ? 0.055 : 0.034),
  );
  const reflectSkew = useTransform(flowTime, (t) => Math.sin(t * 0.45 + phase) * 14);
  const reflectX = useTransform(
    flowTime,
    (t) => Math.sin(t * 0.16) * 8 + Math.sin(t * 0.7 + phase) * 3.5,
  );
  const reflectOp = useTransform(flowTime, (t) => 0.38 + Math.sin(t * 0.9 + phase) * 0.1);
  const waterlineOp = useTransform(flowTime, (t) => 0.55 + Math.sin(t * 1.1 + phase) * 0.12);

  const reflectionColor =
    reflection === "pink" ? "rgba(200,110,145,0.55)" : "rgba(22,70,55,0.55)";

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

  // Scene-matched grade — pads darker/less neon; flowers slightly muted into pond light
  const grade =
    kind === "pad"
      ? `brightness(${brightness * 0.78}) saturate(0.82) contrast(1.12)`
      : kind === "baby"
        ? `brightness(${brightness * 0.88}) saturate(0.9) contrast(1.06)`
        : `brightness(${brightness * 0.9}) saturate(0.92) contrast(1.07)`;

  const canvasStyle = {
    width: "100%",
    height: "auto",
    display: "block" as const,
    transform: flip ? "scaleX(-1)" : undefined,
    filter: grade,
  };

  const bodyClip = kind === "baby" ? "inset(38% 0 0 0)" : "inset(36% 0 0 0)";
  const petalClip = kind === "baby" ? "inset(0 5% 46% 5%)" : "inset(0 4% 42% 4%)";

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: widthPx,
        x: nudgeX,
        y: nudgeY,
        zIndex: Math.round(10 + topPct),
      }}
    >
      <motion.div
        className="relative"
        style={
          reducedMotion || !mounted
            ? { rotate: rotateDeg, scaleY: planeScaleY }
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
        {/* Soft underwater stain / contact pool */}
        <div
          className="pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2 rounded-[100%] blur-[16px]"
          style={{
            width: kind === "pad" ? "95%" : "78%",
            height: kind === "pad" ? "38%" : "32%",
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 72%)`,
            opacity: 0.85,
          }}
        />

        {/* Distorted sprite reflection seated in the water */}
        <motion.div
          className="pointer-events-none absolute left-[50%] top-[86%] w-[92%] -translate-x-1/2 origin-top overflow-hidden"
          style={{
            height: kind === "pad" ? "42%" : "48%",
            opacity: reflectOp,
            x: reflectX,
            skewX: reflectSkew,
            filter: "blur(2.5px) brightness(0.55) saturate(0.85)",
          }}
        >
          <canvas
            ref={reflectRef}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              transform: `scaleX(${flip ? -1 : 1}) scaleY(-1)`,
              transformOrigin: "center top",
              opacity: 0.55,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,20,16,0.15) 0%, rgba(0,12,10,0.55) 55%, rgba(0,8,8,0.9) 100%)",
            }}
          />
        </motion.div>

        {/* Hard-ish contact shadow under silhouette */}
        <div
          className="pointer-events-none absolute left-[52%] top-[72%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,4,4,0.72)_0%,_transparent_70%)]"
          style={{ width: "88%", height: "26%", filter: "blur(3px)" }}
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
                transformOrigin: "50% 28%",
                skewX: petalRock,
                scaleX: petalStretch,
              }}
            >
              <canvas ref={petalRef} style={canvasStyle} />
            </motion.div>
          </>
        )}

        {/* Scene light — soft upper-left only, no neon wash */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse 55% 45% at 18% 14%, rgba(255,245,220,0.28) 0%, transparent 55%)",
              opacity: 0.55,
              mixBlendMode: "soft-light",
            }}
          />
        )}
        {/* Ambient pond tint so plants share water color temperature */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "radial-gradient(ellipse at 50% 70%, transparent 35%, rgba(0,28,24,0.28) 100%)",
              opacity: 0.9,
              mixBlendMode: "multiply",
            }}
          />
        )}
        {/* Wet waterline — bright rim where body meets surface */}
        {maskUrl && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "linear-gradient(to top, rgba(170,220,200,0.42) 0%, rgba(255,245,220,0.12) 10%, transparent 22%)",
              opacity: waterlineOp,
            }}
          />
        )}
        {/* Soft submerged film on lower body — embeds into surface */}
        {maskUrl && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...silhouetteMask,
              background:
                "linear-gradient(to top, rgba(8,40,34,0.35) 0%, rgba(8,40,34,0.12) 18%, transparent 38%)",
              opacity: 0.85,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
