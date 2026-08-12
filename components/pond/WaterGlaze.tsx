"use client";

import { motion, type MotionValue, useTransform } from "motion/react";

type WaterGlazeProps = {
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
};

/** Very light surface skim — keeps plants crisp (not submerged). */
export function WaterGlaze({ reducedMotion, flowTime }: WaterGlazeProps) {
  const bandX = useTransform(flowTime, (t) => `${((t * 10) % 150) - 35}%`);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -inset-[40%] opacity-[0.1]"
        style={{
          willChange: "transform",
          backgroundImage: "url(/pond/pond-water-dark.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        animate={{ x: [0, -180], y: [0, -70] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-y-0 w-[22%] bg-[linear-gradient(100deg,transparent_0%,rgba(255,240,210,0.08)_50%,transparent_100%)]"
        style={{ left: bandX }}
      />
    </div>
  );
}
