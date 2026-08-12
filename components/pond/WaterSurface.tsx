"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/** Deep emerald pond — continuous current + ONE stable upper-left sun.
 * No moving light bands / scanning streaks. */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020e0b]">
      <div
        className="absolute -inset-[14%]"
        style={{
          filter: reducedMotion ? undefined : `url(#${WATER_FLOW_FILTER_ID})`,
        }}
      >
        <Image
          src="/pond/pond-water-dark.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.82] contrast-[1.12] saturate-[1.15]"
        />
        <div className="absolute inset-0 opacity-[0.12]">
          <Image
            src="/pond/pond-reflection.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-[3px]"
          />
        </div>
      </div>

      {/* Stable sun — fixed position, never translates across the screen */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_52%_44%_at_14%_10%,_rgba(255,228,170,0.16)_0%,_transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_90%_85%,_rgba(0,8,6,0.5)_0%,_transparent_60%)]" />

      {/* Directional current sheet — water texture flows, light does not */}
      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[60%] opacity-[0.4]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, -320], y: [0, -130] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-dark.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.85]"
          />
        </motion.div>
      )}

      {/* Soft swell — opacity pulse only, no traveling streak */}
      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_18%,_rgba(255,235,190,0.06),_transparent_68%)]"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
