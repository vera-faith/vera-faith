"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/**
 * One living pond surface: darker emerald water, continuous current,
 * and a STABLE upper-left sun (highlights only — never a moving beam).
 */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#02120e]">
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
      </div>

      {/* Stable sun pool — fixed position, no travel */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_52%_44%_at_14%_10%,_rgba(255,228,160,0.22)_0%,_rgba(180,210,170,0.06)_42%,_transparent_70%)]" />
      {/* Depth: dark far corner opposite the sun */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_92%_88%,_rgba(0,6,5,0.62)_0%,_transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_70%_30%,_rgba(0,12,10,0.18)_0%,_transparent_70%)]" />

      {/* Continuous directional current — texture drifts with the flow */}
      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[60%] opacity-[0.42]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, -320], y: [0, -130] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
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

      {/* Soft swell — opacity pulse only (no streak geometry) */}
      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_20%_18%,_rgba(255,235,190,0.08),_transparent_72%)]"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
