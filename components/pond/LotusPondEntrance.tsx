"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { WaterFlowFilter } from "@/components/pond/WaterFlowFilter";
import { WaterSurface } from "@/components/pond/WaterSurface";
import { WaterSpecular } from "@/components/pond/WaterSpecular";
import { FloatingElement } from "@/components/pond/FloatingElement";
import { CausticsLayer } from "@/components/pond/CausticsLayer";
import { SparkleAura } from "@/components/pond/SparkleAura";
import { RainRipples, type PlantAnchor } from "@/components/pond/RainRipples";

const NUDGE_SPRING = { stiffness: 48, damping: 18, mass: 0.55 };

/**
 * Curated glassy pond composition — open water, bloom variety, no stacks.
 * Sprites: neo-glass lotuses + wet veined pads.
 */
const FLOATERS = [
  { src: "/pond/sprite-lotus-glass-full.png", left: 7, top: 6, width: 142, rotate: -6, flip: false, phase: 0.2, drift: 15, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.06, cx: 13, cy: 14 },
  { src: "/pond/sprite-pad-glass.png", left: 48, top: 3, width: 172, rotate: 12, flip: false, phase: 0.85, drift: 16, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 1.05, cx: 55, cy: 13 },
  { src: "/pond/sprite-lotus-glass-mid.png", left: 74, top: 8, width: 108, rotate: 9, flip: false, phase: 1.4, drift: 13, influence: 3.5, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.04, cx: 79, cy: 15 },
  { src: "/pond/sprite-lotus-glass-full.png", left: 34, top: 32, width: 188, rotate: 2, flip: false, phase: 2.3, drift: 15, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.08, cx: 42, cy: 44 },
  { src: "/pond/sprite-pad-glass.png", left: 2, top: 50, width: 198, rotate: -10, flip: true, phase: 0.35, drift: 16, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.92, cx: 10, cy: 62 },
  { src: "/pond/sprite-lotus-glass-baby.png", left: 22, top: 56, width: 62, rotate: -14, flip: true, phase: 2.9, drift: 11, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.03, cx: 25, cy: 61 },
  { src: "/pond/sprite-pad-glass.png", left: 66, top: 48, width: 158, rotate: 4, flip: false, phase: 3.5, drift: 15, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 1.02, cx: 73, cy: 58 },
  { src: "/pond/sprite-lotus-glass-mid.png", left: 52, top: 62, width: 92, rotate: -12, flip: true, phase: 4.0, drift: 12, influence: 3.5, kind: "lotus" as const, reflection: "pink" as const, brightness: 0.99, cx: 56, cy: 68 },
  { src: "/pond/sprite-pad-glass.png", left: 36, top: 72, width: 152, rotate: -2, flip: true, phase: 4.6, drift: 14, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.94, cx: 42, cy: 82 },
  { src: "/pond/sprite-lotus-glass-baby.png", left: 78, top: 70, width: 54, rotate: 16, flip: false, phase: 5.2, drift: 10, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.01, cx: 81, cy: 75 },
] as const;

/** Majestic neo-glass anime lotus pond — unified living scenery. */
export function LotusPondEntrance() {
  const reducedMotion = usePrefersReducedMotion();
  const flowTime = useMotionValue(0);
  const flowTimeRef = useRef(0);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorSpringX = useSpring(cursorX, NUDGE_SPRING);
  const cursorSpringY = useSpring(cursorY, NUDGE_SPRING);

  const anchors = useMemo<PlantAnchor[]>(
    () =>
      FLOATERS.map((f) => ({
        nx: f.cx / 100,
        ny: f.cy / 100,
        radius: f.width / 1650,
        tint: f.reflection,
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
      className="relative h-dvh w-full overflow-hidden bg-[#010c09]"
      aria-label="Immersive lotus pond entrance"
    >
      <WaterFlowFilter
        reducedMotion={reducedMotion}
        onFlow={(t) => {
          flowTime.set(t);
          flowTimeRef.current = t;
        }}
      />

      <WaterSurface reducedMotion={reducedMotion} />
      <WaterSpecular reducedMotion={reducedMotion} flowTime={flowTime} />

      {/* Stable sun atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_48%_42%_at_12%_8%,_rgba(255,232,180,0.11),_transparent_62%)]" />

      <div className="pointer-events-none absolute inset-0">
        {FLOATERS.map((f, i) => (
          <FloatingElement
            key={i}
            src={f.src}
            leftPct={f.left}
            topPct={f.top}
            widthPx={f.width}
            rotateDeg={f.rotate}
            flip={f.flip}
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
      </div>

      {/* Ripples under sparkles so glints sit on the living surface */}
      <RainRipples reducedMotion={reducedMotion} anchors={anchors} flowTimeRef={flowTimeRef} />
      <CausticsLayer reducedMotion={reducedMotion} />
      <SparkleAura reducedMotion={reducedMotion} flowTime={flowTime} />

      {/* Cinematic depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_48%,_rgba(0,6,5,0.52)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_15%_10%,_rgba(255,245,220,0.06),_transparent_70%)]" />
    </section>
  );
}
