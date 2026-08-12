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

const NUDGE_SPRING = { stiffness: 48, damping: 18, mass: 0.55 };

/**
 * Reference composition (open water, no stacked overlaps):
 * 2 full lotuses + 1 baby/partial + 5 pads — all on one plane.
 * Positions leave deliberate gaps so nothing reads as layered collage.
 */
const FLOATERS = [
  // Pads first (visual base of the plane)
  { src: "/pond/sprite-pad-veined.png", left: 6, top: 10, width: 175, rotate: -14, flip: false, phase: 0.2, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 1.04, cx: 13, cy: 20 },
  { src: "/pond/sprite-pad-shadow.png", left: 58, top: 6, width: 155, rotate: 12, flip: true, phase: 1.4, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 1.02, cx: 65, cy: 15 },
  { src: "/pond/sprite-pad-veined.png", left: 8, top: 52, width: 200, rotate: 8, flip: false, phase: 2.8, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.94, cx: 16, cy: 64 },
  { src: "/pond/sprite-pad-shadow.png", left: 70, top: 54, width: 170, rotate: -6, flip: false, phase: 3.6, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.96, cx: 78, cy: 64 },
  { src: "/pond/sprite-pad-veined.png", left: 38, top: 72, width: 160, rotate: 4, flip: true, phase: 4.8, influence: 2.5, kind: "pad" as const, reflection: "green" as const, brightness: 0.92, cx: 45, cy: 82 },

  // Flowers — spaced in open water, never stacked on pads
  { src: "/pond/sprite-lotus-full.png", left: 26, top: 16, width: 145, rotate: -10, flip: false, phase: 0.6, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.05, cx: 32, cy: 26 },
  { src: "/pond/sprite-lotus-full.png", left: 44, top: 40, width: 185, rotate: 3, flip: false, phase: 2.1, influence: 4, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.07, cx: 52, cy: 52 },
  { src: "/pond/sprite-lotus-partial.png", left: 78, top: 24, width: 95, rotate: 14, flip: false, phase: 1.1, influence: 3.5, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.03, cx: 82, cy: 32 },
  { src: "/pond/sprite-lotus-baby.png", left: 18, top: 78, width: 58, rotate: -16, flip: true, phase: 5.2, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 1.02, cx: 21, cy: 83 },
] as const;

/** Dark dreamy anime pond — one water plane, one current, one stable sun. */
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
      className="relative h-dvh w-full overflow-hidden bg-[#02120e]"
      aria-label="Immersive lotus pond entrance"
    >
      <WaterFlowFilter reducedMotion={reducedMotion} onFlow={(t) => flowTime.set(t)} />

      <WaterSurface reducedMotion={reducedMotion} />

      {/* Shared flora plane — single stacking context, same water level */}
      <div className="pointer-events-none absolute inset-0">
        <WaterGlaze reducedMotion={reducedMotion} />

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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_52%,_rgba(0,8,6,0.48)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/35" />
    </section>
  );
}
