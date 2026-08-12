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
 * Living pond — glass anime-realism lotuses at varied bloom stages.
 * Water current down-right; flora drifts on the same axis.
 */
const FLOATERS = [
  { src: "/pond/sprite-lotus-glass-full.png", left: 10, top: 8, width: 150, rotate: -6, flip: false, phase: 0.2, drift: 22, influence: 3.2, kind: "lotus" as const, reflection: "pink" as const, brightness: 0.98, cx: 16, cy: 16 },
  { src: "/pond/sprite-pad-veined.png", left: 46, top: 4, width: 180, rotate: 7, flip: false, phase: 0.8, drift: 26, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.92, cx: 54, cy: 12 },
  { src: "/pond/sprite-lotus-glass-baby.png", left: 74, top: 9, width: 64, rotate: 10, flip: false, phase: 1.4, drift: 20, influence: 3.2, kind: "baby" as const, reflection: "pink" as const, brightness: 0.9, cx: 78, cy: 15 },
  { src: "/pond/sprite-lotus-glass-full.png", left: 30, top: 30, width: 200, rotate: 2, flip: false, phase: 2.2, drift: 24, influence: 3.2, kind: "lotus" as const, reflection: "pink" as const, brightness: 1.0, cx: 40, cy: 42 },
  { src: "/pond/sprite-pad-veined.png", left: 2, top: 46, width: 195, rotate: -9, flip: true, phase: 0.4, drift: 26, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.86, cx: 10, cy: 58 },
  { src: "/pond/sprite-lotus-glass-mid.png", left: 20, top: 54, width: 112, rotate: -10, flip: true, phase: 2.9, drift: 18, influence: 2.8, kind: "mid" as const, reflection: "pink" as const, brightness: 0.94, cx: 26, cy: 60 },
  { src: "/pond/sprite-pad-veined.png", left: 64, top: 48, width: 162, rotate: 4, flip: false, phase: 3.5, drift: 24, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.9, cx: 72, cy: 58 },
  { src: "/pond/sprite-lotus-partial.png", left: 48, top: 60, width: 100, rotate: -8, flip: false, phase: 4.0, drift: 19, influence: 2.8, kind: "mid" as const, reflection: "pink" as const, brightness: 0.93, cx: 54, cy: 66 },
  { src: "/pond/sprite-pad-veined.png", left: 34, top: 72, width: 152, rotate: -4, flip: true, phase: 4.6, drift: 22, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.88, cx: 41, cy: 82 },
  { src: "/pond/sprite-lotus-glass-baby.png", left: 76, top: 68, width: 52, rotate: 14, flip: false, phase: 5.1, drift: 18, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 0.88, cx: 79, cy: 74 },
  { src: "/pond/sprite-lotus-glass-mid.png", left: 58, top: 20, width: 84, rotate: -4, flip: true, phase: 5.8, drift: 18, influence: 2.8, kind: "mid" as const, reflection: "pink" as const, brightness: 0.92, cx: 62, cy: 26 },
] as const;

/** Looking down-and-out into a living pond — one camera, one current. */
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
        // Large enough that flow visibly wraps the silhouette
        radius: f.kind === "pad" ? f.width / 1100 : f.width / 1300,
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
      className="relative h-dvh w-full overflow-hidden bg-[#010a09]"
      aria-label="Immersive lotus pond entrance"
      style={{ perspective: "1600px" }}
    >
      <WaterFlowFilter
        reducedMotion={reducedMotion}
        onFlow={(t) => {
          flowTime.set(t);
          flowTimeRef.current = t;
        }}
      />

      {/* Shared camera: look down-and-out so water + plants match */}
      <div
        className="absolute inset-[-6%] origin-[50%_40%]"
        style={{
          transform: "rotateX(14deg) rotateZ(-1.5deg) scale(1.1)",
          transformStyle: "preserve-3d",
        }}
      >
        <WaterSurface reducedMotion={reducedMotion} />
        <WaterSpecular reducedMotion={reducedMotion} flowTime={flowTime} />
        <CausticsLayer reducedMotion={reducedMotion} />
        <SparkleAura reducedMotion={reducedMotion} flowTime={flowTime} />
        {/* Ripples under flora so plants sit in the water, not under graphic rings */}
        <RainRipples reducedMotion={reducedMotion} anchors={anchors} flowTimeRef={flowTimeRef} />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_40%_at_12%_8%,_rgba(255,230,175,0.08),_transparent_64%)]" />

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
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_48%,_rgba(0,5,5,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/42" />
    </section>
  );
}
