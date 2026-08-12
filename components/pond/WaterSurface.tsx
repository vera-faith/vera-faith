"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/** Deep emerald anime pond — continuous current + soft single upper-left sun.
 * No diagonal light shafts; lighting lives in shimmer and highlights. */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#031510]">
      <div
        className="absolute -inset-[12%]"
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
          className="object-cover brightness-[0.92] contrast-[1.08] saturate-[1.1]"
        />
        {/* Soft canopy tint — very low so it does not read as light beams */}
        <div className="absolute inset-0 opacity-[0.14]">
          <Image
            src="/pond/pond-reflection.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-[2px]"
          />
        </div>
      </div>

      {/* ONE warm sun source from upper-left — selective highlights only */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_48%_40%_at_16%_10%,_rgba(255,230,170,0.14)_0%,_transparent_65%)]" />
      {/* Deep shadow pool opposite the sun */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_88%_82%,_rgba(0,10,8,0.42)_0%,_transparent_65%)]" />

      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[55%] opacity-[0.34]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, -280], y: [0, -110] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-dark.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_30%_25%,_rgba(255,235,190,0.07),_transparent_70%)]"
          animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.03, 1] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
