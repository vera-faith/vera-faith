"use client";

import { useEffect, useMemo } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { WaterFlowFilter } from "@/components/pond/WaterFlowFilter";
import { WaterSurface } from "@/components/pond/WaterSurface";
import { WaterGlaze } from "@/components/pond/WaterGlaze";
import { FloatingElement } from "@/components/pond/FloatingElement";
import { CausticsLayer } from "@/components/pond/CausticsLayer";
import { RainRipples, type PlantAnchor } from "@/components/pond/RainRipples";

const NUDGE_SPRING = { stiffness: 50, damping: 16, mass: 0.5 };

/**
 * Reference-matched composition: open water, mixed bloom stages (full /
 * partial / baby), veined pads, natural spacing — blueprint from pond-reference.
 */
const FLOATERS = [
  // Fully open lotuses
  { src: "/pond/sprite-lotus-full.png", left: 10, top: 8, width: 155, rotate: -8, flip: false, freqScale: 0.95, phase: 0.3, drift: 11, influence: 5, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.06, cx: 16, cy: 16 },
  { src: "/pond/sprite-lotus-full.png", left: 38, top: 34, width: 195, rotate: 4, flip: false, freqScale: 0.88, phase: 2.5, drift: 12, influence: 5, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.08, cx: 45, cy: 46 },
  // Partial blooms
  { src: "/pond/sprite-lotus-baby.png", left: 84, top: 26, width: 78, rotate: 18, flip: false, freqScale: 1.2, phase: 0.8, drift: 8, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.05, cx: 87, cy: 31 },
  { src: "/pond/sprite-lotus-baby.png", left: 24, top: 56, width: 72, rotate: -20, flip: true, freqScale: 1.15, phase: 3.1, drift: 8, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.02, cx: 27, cy: 61 },
  { src: "/pond/sprite-lotus-baby.png", left: 46, top: 76, width: 68, rotate: 8, flip: false, freqScale: 1.25, phase: 5.4, drift: 7, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 0.97, cx: 49, cy: 81 },
  { src: "/pond/sprite-lotus-baby.png", left: 5, top: 36, width: 64, rotate: -6, flip: false, freqScale: 1.18, phase: 2.0, drift: 7, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.0, cx: 8, cy: 41 },
  { src: "/pond/sprite-lotus-partial.png", left: 72, top: 10, width: 118, rotate: 12, flip: false, freqScale: 1.05, phase: 1.4, drift: 10, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.04, cx: 77, cy: 17 },
  { src: "/pond/sprite-lotus-partial.png", left: 57, top: 60, width: 105, rotate: -14, flip: true, freqScale: 1.1, phase: 4.2, drift: 9, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 0.98, cx: 62, cy: 67 },
  // Lily pads — veined, varied size / sun vs shade
  { src: "/pond/sprite-pad-veined.png", left: 55, top: 6, width: 195, rotate: 16, flip: false, freqScale: 1.0, phase: 1.1, drift: 12, influence: 3, kind: "pad" as const, reflection: "green" as const, brightness: 1.05, cx: 62, cy: 16 },
  { src: "/pond/sprite-pad-shadow.png", left: 4, top: 52, width: 220, rotate: -10, flip: false, freqScale: 0.98, phase: 0.2, drift: 13, influence: 3, kind: "pad" as const, reflection: "green" as const, brightness: 0.92, cx: 12, cy: 64 },
  { src: "/pond/sprite-pad-veined.png", left: 70, top: 48, width: 175, rotate: 6, flip: true, freqScale: 1.06, phase: 3.8, drift: 11, influence: 3, kind: "pad" as const, reflection: "green" as const, brightness: 1.02, cx: 77, cy: 58 },
  { src: "/pond/sprite-pad-shadow.png", left: 32, top: 70, width: 165, rotate: -4, flip: true, freqScale: 1.02, phase: 4.9, drift: 11, influence: 3, kind: "pad" as const, reflection: "green" as const, brightness: 0.95, cx: 38, cy: 80 },
] as const;

/** Dark dreamy anime lotus pond — crisp flora on a living water surface. */
export function LotusPondEntrance() {
  const reducedMotion = usePrefersReducedMotion();
  const flowTime = useMotionValue(0);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorSpringX = useSpring(cursorX, NUDGE_SPRING);
  const cursorSpringY = useSpring(cursorY, NUDGE_SPRING);

  const anchors = useMemo<PlantAnchor[]>(
    () =>
      FLOATERS.map((f) => ({
        nx: f.cx / 100,
        ny: f.cy / 100,
        radius: f.width / 1600,
      })),
    [],
  );

  useEffect(() => {
    if (reducedMotion) return;
    function onPointerMove(event: PointerEvent) {
      cursorX.set((event.clientX / window.innerWidth) * 2 - 1);
      cursorY.set((event.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reducedMotion, cursorX, cursorY]);

  return (
    <section
      className="relative h-dvh w-full overflow-hidden bg-[#031510]"
      aria-label="Immersive lotus pond entrance"
    >
      <WaterFlowFilter reducedMotion={reducedMotion} onFlow={(t) => flowTime.set(t)} />

      <WaterSurface reducedMotion={reducedMotion} />

      {/* Soft sun — upper-left only, no haze streak */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_42%_36%_at_14%_8%,_rgba(255,232,180,0.1),_transparent_62%)]" />

      {FLOATERS.map((f, i) => (
        <FloatingElement
          key={i}
          src={f.src}
          leftPct={f.left}
          topPct={f.top}
          widthPx={f.width}
          rotateDeg={f.rotate}
          flip={f.flip}
          freqScale={f.freqScale}
          phase={f.phase}
          driftPx={f.drift}
          influence={f.influence}
          kind={f.kind}
          reflection={f.reflection}
          brightness={f.brightness}
          reducedMotion={reducedMotion}
          flowTime={flowTime}
          cursorX={cursorSpringX}
          cursorY={cursorSpringY}
        />
      ))}

      <CausticsLayer reducedMotion={reducedMotion} />
      <WaterGlaze reducedMotion={reducedMotion} flowTime={flowTime} />
      <RainRipples reducedMotion={reducedMotion} anchors={anchors} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_58%,_rgba(1,10,8,0.42)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
    </section>
  );
}
