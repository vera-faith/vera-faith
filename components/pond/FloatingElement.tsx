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
  kind?: "pad" | "lotus" | "baby" | "mid";
  reflection?: "pink" | "green";
  brightness?: number;
};

/** Flora on the pond plane — lotuses stay crisp/opaque; pads settle into water. */
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

  const isFlower = kind === "lotus" || kind === "baby" || kind === "mid";
  const usePetals = isFlower;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mode = isFlower ? "lotus" : "pad";
    // Tighter feather for flowers so petals stay crisp, not smoky
    const feather = isFlower ? 8 : 16;
    const tolerance = isFlower ? 28 : 34;
    loadKeyedSprite(src, { tolerance, feather, mode }).then((matted) => {
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
  }, [src, isFlower]);

  const bobAmp = kind === "baby" ? 1.15 : kind === "mid" ? 1.05 : kind === "lotus" ? 0.95 : 0.85;
  const rockAmp = kind === "baby" ? 4.2 : kind === "mid" ? 3.2 : kind === "lotus" ? 2.2 : 1.8;
  const swayAmp = kind === "baby" ? 3.6 : kind === "mid" ? 2.8 : kind === "lotus" ? 2.2 : 2;
  const petalAmp = kind === "baby" ? 3.8 : kind === "mid" ? 2.8 : 2.2;
  // Flowers keep more upright volume; pads foreshorten with the water plane
  const planeScaleY = isFlower
    ? 0.94 + (topPct / 100) * 0.04
    : 0.86 + (topPct / 100) * 0.1;

  const nudgeX = useTransform(cursorX, (v) => v * influence);
  const nudgeY = useTransform(cursorY, (v) => v * influence);

  const driftX = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.16 + phase * 0.05) * driftPx;
    const local = Math.sin(t * 0.48 + phase) * (kind === "baby" ? 3.4 : 2);
    return current + local;
  });
  const driftY = useTransform(flowTime, (t) => {
    const current = Math.sin(t * 0.16 + phase * 0.05) * driftPx * 0.82;
    const bob = Math.cos(t * 0.52 + phase) * 3.2 * bobAmp;
    return current + bob;
  });
  const sway = useTransform(
    flowTime,
    (t) =>
      rotateDeg +
      Math.sin(t * 0.2) * 1.4 +
      Math.sin(t * 0.55 + phase) * swayAmp,
  );
  const rock = useTransform(flowTime, (t) => Math.sin(t * 0.65 + phase) * rockAmp);
  const stretchX = useTransform(
    flowTime,
    (t) =>
      1 +
      Math.sin(t * 0.5 + phase * 0.4) *
        (kind === "baby" ? 0.03 : isFlower ? 0.02 : 0.014),
  );
  const stretchY = useTransform(
    flowTime,
    (t) =>
      planeScaleY *
      (1 +
        Math.cos(t * 0.46 + phase * 0.9) *
          (kind === "baby" ? 0.026 : isFlower ? 0.016 : 0.012)),
  );
  const petalRock = useTransform(
    flowTime,
    (t) => Math.sin(t * 0.95 + phase * 1.7) * petalAmp,
  );
  const petalStretch = useTransform(
    flowTime,
    (t) => 1 + Math.sin(t * 0.85 + phase * 2) * (kind === "baby" ? 0.04 : 0.024),
  );
  const reflectSkew = useTransform(flowTime, (t) => Math.sin(t * 0.45 + phase) * 12);
  const reflectX = useTransform(
    flowTime,
    (t) => Math.sin(t * 0.16) * 7 + Math.sin(t * 0.7 + phase) * 3,
  );
  const reflectOp = useTransform(flowTime, (t) => 0.42 + Math.sin(t * 0.9 + phase) * 0.1);
  const waterlineOp = useTransform(flowTime, (t) => 0.5 + Math.sin(t * 1.1 + phase) * 0.1);

  const reflectionColor =
    reflection === "pink" ? "rgba(210,120,155,0.62)" : "rgba(22,70,55,0.55)";

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

  // Flowers: soft anime-realism. Small buds sit deeper into pond tone.
  const grade =
    kind === "baby"
      ? `brightness(${brightness * 0.9}) saturate(0.95) contrast(1.05)`
      : kind === "mid"
        ? `brightness(${brightness * 0.93}) saturate(0.98) contrast(1.05)`
        : isFlower
          ? `brightness(${brightness * 0.96}) saturate(1.02) contrast(1.06)`
          : `brightness(${brightness * 0.74}) saturate(0.8) contrast(1.12)`;

  const isSmallBloom = kind === "baby" || kind === "mid";
  const contactW = kind === "pad" ? "92%" : isSmallBloom ? "78%" : "68%";
  const contactH = kind === "pad" ? "34%" : isSmallBloom ? "32%" : "26%";
  const contactTop = isSmallBloom ? "78%" : "82%";
  const reflectH = kind === "pad" ? "38%" : isSmallBloom ? "48%" : "40%";
  const reflectTop = isSmallBloom ? "86%" : "90%";
  const wetBase =
    kind === "baby"
      ? "linear-gradient(to top, rgba(25,80,68,0.42) 0%, rgba(35,95,80,0.18) 18%, transparent 36%)"
      : kind === "mid"
        ? "linear-gradient(to top, rgba(30,88,72,0.34) 0%, transparent 18%)"
        : "linear-gradient(to top, rgba(35,95,80,0.28) 0%, transparent 12%)";
  const waterlineH =
    kind === "baby"
      ? "linear-gradient(to top, rgba(185,225,205,0.5) 0%, transparent 12%)"
      : "linear-gradient(to top, rgba(185,225,205,0.4) 0%, transparent 7%)";

  const canvasStyle = {
    width: "100%",
    height: "auto",
    display: "block" as const,
    transform: flip ? "scaleX(-1)" : undefined,
    filter: grade,
  };

  const bodyClip =
    kind === "baby" ? "inset(40% 0 0 0)" : kind === "mid" ? "inset(38% 0 0 0)" : "inset(36% 0 0 0)";
  const petalClip =
    kind === "baby" ? "inset(0 6% 48% 6%)" : kind === "mid" ? "inset(0 5% 44% 5%)" : "inset(0 4% 42% 4%)";

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
        {/* Contact stain in the water */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[100%] blur-[12px]"
          style={{
            top: contactTop,
            width: contactW,
            height: contactH,
            background: `radial-gradient(ellipse at center, ${reflectionColor} 0%, transparent 72%)`,
            opacity: isSmallBloom ? 0.95 : isFlower ? 0.82 : 0.88,
          }}
        />

        {/* Distorted sprite reflection */}
        <motion.div
          className="pointer-events-none absolute left-[50%] w-[90%] -translate-x-1/2 origin-top overflow-hidden"
          style={{
            top: reflectTop,
            height: reflectH,
            opacity: reflectOp,
            x: reflectX,
            skewX: reflectSkew,
            filter: isFlower
              ? "blur(2.2px) brightness(0.55) saturate(1.15)"
              : "blur(2.5px) brightness(0.52) saturate(0.85)",
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
              opacity: isSmallBloom ? 0.8 : isFlower ? 0.7 : 0.52,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,20,16,0.08) 0%, rgba(0,12,10,0.55) 48%, rgba(0,8,8,0.95) 100%)",
            }}
          />
        </motion.div>

        {/* Contact shadow — seats object into surface */}
        <div
          className="pointer-events-none absolute left-[52%] top-[76%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,4,4,0.78)_0%,_transparent_70%)]"
          style={{
            width: isSmallBloom ? "78%" : isFlower ? "70%" : "90%",
            height: isSmallBloom ? "22%" : isFlower ? "18%" : "24%",
            filter: "blur(2.5px)",
          }}
        />
        <div
          className="pointer-events-none absolute left-[60%] top-[80%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,6,5,0.42)_0%,_transparent_72%)]"
          style={{ width: "58%", height: "14%", filter: "blur(6px)" }}
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

        {maskUrl && isFlower && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background:
                  "radial-gradient(ellipse 45% 38% at 20% 14%, rgba(255,248,230,0.28) 0%, transparent 52%)",
                opacity: 0.5,
                mixBlendMode: "soft-light",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background:
                  "radial-gradient(ellipse at 50% 72%, rgba(70,30,45,0.2) 0%, transparent 50%)",
                opacity: 0.65,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background: wetBase,
                opacity: kind === "baby" ? 0.95 : 0.8,
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background: waterlineH,
                opacity: waterlineOp,
              }}
            />
            {kind === "baby" && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  ...silhouetteMask,
                  background:
                    "radial-gradient(ellipse at 50% 85%, rgba(0,20,16,0.35) 0%, transparent 45%)",
                  opacity: 0.85,
                  mixBlendMode: "multiply",
                }}
              />
            )}
          </>
        )}

        {/* Pad overlays — settled into water */}
        {maskUrl && !isFlower && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background:
                  "radial-gradient(ellipse 55% 45% at 18% 14%, rgba(255,245,220,0.22) 0%, transparent 55%)",
                opacity: 0.5,
                mixBlendMode: "soft-light",
              }}
            />
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
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background:
                  "linear-gradient(to top, rgba(170,220,200,0.38) 0%, transparent 16%)",
                opacity: waterlineOp,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                ...silhouetteMask,
                background:
                  "linear-gradient(to top, rgba(6,36,30,0.4) 0%, transparent 28%)",
                opacity: 0.9,
              }}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
