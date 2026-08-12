"use client";

import { useEffect, useMemo } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { WaterFlowFilter } from "@/components/pond/WaterFlowFilter";
import { WaterSurface } from "@/components/pond/WaterSurface";
import { FloatingElement } from "@/components/pond/FloatingElement";
import { CausticsLayer } from "@/components/pond/CausticsLayer";
import { RainRipples, type PlantAnchor } from "@/components/pond/RainRipples";

const NUDGE_SPRING = { stiffness: 48, damping: 18, mass: 0.55 };

/**
 * Reference composition (pond-reference.jpg): open water, no stacked overlaps,
 * 2 full blooms + 1 partial + a couple babies + spaced pads — one shared plane.
 */
const FLOATERS = [
  { src: "/pond/sprite-lotus-full.png", left: 8, top: 7, width: 138, rotate: -7, flip: false, phase: 0.2, drift: 16, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.05, cx: 14, cy: 15 },
  { src: "/pond/sprite-pad-veined.png", left: 50, top: 4, width: 168, rotate: 14, flip: false, phase: 0.9, drift: 17, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 1.04, cx: 57, cy: 14 },
  { src: "/pond/sprite-lotus-partial.png", left: 76, top: 9, width: 96, rotate: 10, flip: false, phase: 1.5, drift: 14, influence: 3.5, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.03, cx: 81, cy: 16 },
  { src: "/pond/sprite-lotus-full.png", left: 36, top: 34, width: 178, rotate: 3, flip: false, phase: 2.4, drift: 16, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.07, cx: 43, cy: 45 },
  { src: "/pond/sprite-pad-shadow.png", left: 3, top: 52, width: 188, rotate: -11, flip: false, phase: 0.4, drift: 17, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.9, cx: 11, cy: 64 },
  { src: "/pond/sprite-lotus-baby.png", left: 24, top: 58, width: 56, rotate: -16, flip: true, phase: 3.0, drift: 12, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.02, cx: 27, cy: 62 },
  { src: "/pond/sprite-pad-veined.png", left: 68, top: 50, width: 152, rotate: 5, flip: true, phase: 3.6, drift: 16, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 1.0, cx: 75, cy: 60 },
  { src: "/pond/sprite-pad-shadow.png", left: 38, top: 72, width: 148, rotate: -3, flip: true, phase: 4.5, drift: 15, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.93, cx: 44, cy: 82 },
  { src: "/pond/sprite-lotus-baby.png", left: 58, top: 74, width: 50, rotate: 12, flip: false, phase: 5.1, drift: 11, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 0.98, cx: 61, cy: 78 },
] as const;

/** Dark dreamy anime lotus pond — one water plane, one current, one light. */
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
        radius: f.width / 1700,
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
      className="relative h-dvh w-full overflow-hidden bg-[#020e0b]"
      aria-label="Immersive lotus pond entrance"
    >
      <WaterFlowFilter reducedMotion={reducedMotion} onFlow={(t) => flowTime.set(t)} />

      <WaterSurface reducedMotion={reducedMotion} />

      {/* Stable sun wash — does not move */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_40%_at_13%_9%,_rgba(255,230,175,0.09),_transparent_60%)]" />

      {/* All flora share one stacking context / water plane */}
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

      <CausticsLayer reducedMotion={reducedMotion} />
      <RainRipples reducedMotion={reducedMotion} anchors={anchors} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_52%,_rgba(1,8,6,0.48)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/35" />
    </section>
  );
}
