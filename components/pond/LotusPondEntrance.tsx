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
 * Living pond composition — water + flora share one angled camera.
 * Current flows down-right; every plant drifts and sways on that axis.
 */
const FLOATERS = [
  { src: "/pond/sprite-lotus-angle-full.png", left: 8, top: 6, width: 148, rotate: -5, flip: false, phase: 0.2, drift: 26, influence: 3.5, kind: "lotus" as const, reflection: "pink" as const, brightness: 0.94, cx: 14, cy: 14 },
  { src: "/pond/sprite-pad-angle.png", left: 46, top: 3, width: 185, rotate: 7, flip: false, phase: 0.8, drift: 28, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.9, cx: 54, cy: 12 },
  { src: "/pond/sprite-lotus-angle-baby.png", left: 74, top: 8, width: 82, rotate: 12, flip: false, phase: 1.4, drift: 22, influence: 3.2, kind: "baby" as const, reflection: "pink" as const, brightness: 0.92, cx: 78, cy: 14 },
  { src: "/pond/sprite-lotus-angle-full.png", left: 32, top: 32, width: 205, rotate: 1, flip: false, phase: 2.2, drift: 28, influence: 3.5, kind: "lotus" as const, reflection: "pink" as const, brightness: 0.95, cx: 41, cy: 44 },
  { src: "/pond/sprite-pad-angle.png", left: 2, top: 46, width: 205, rotate: -9, flip: true, phase: 0.4, drift: 28, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.84, cx: 10, cy: 58 },
  { src: "/pond/sprite-lotus-angle-baby.png", left: 22, top: 56, width: 70, rotate: -14, flip: true, phase: 2.9, drift: 20, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 0.9, cx: 25, cy: 61 },
  { src: "/pond/sprite-pad-angle.png", left: 64, top: 48, width: 168, rotate: 4, flip: false, phase: 3.5, drift: 26, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.88, cx: 72, cy: 58 },
  { src: "/pond/sprite-lotus-angle-baby.png", left: 50, top: 62, width: 76, rotate: -10, flip: false, phase: 4.0, drift: 21, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 0.9, cx: 54, cy: 68 },
  { src: "/pond/sprite-pad-angle.png", left: 34, top: 72, width: 160, rotate: -4, flip: true, phase: 4.6, drift: 24, influence: 2, kind: "pad" as const, reflection: "green" as const, brightness: 0.86, cx: 41, cy: 82 },
  { src: "/pond/sprite-lotus-angle-baby.png", left: 76, top: 70, width: 64, rotate: 16, flip: false, phase: 5.1, drift: 19, influence: 3, kind: "baby" as const, reflection: "pink" as const, brightness: 0.91, cx: 79, cy: 75 },
  { src: "/pond/sprite-lotus-angle-baby.png", left: 58, top: 22, width: 58, rotate: -6, flip: true, phase: 5.8, drift: 18, influence: 2.8, kind: "baby" as const, reflection: "pink" as const, brightness: 0.89, cx: 61, cy: 26 },
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
        radius: f.width / 1500,
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
