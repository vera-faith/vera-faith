"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID, WATER_MICRO_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/** Living HD glassy emerald pond — strong current, visible wave warp, depth. */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#010a08]">
      <div
        className="absolute -inset-[18%]"
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
          className="object-cover brightness-[0.78] contrast-[1.22] saturate-[1.3]"
        />
        {/* Sharp secondary texture — keeps detail under displacement */}
        <div className="absolute inset-0 opacity-[0.45]">
          <Image
            src="/pond/pond-water-flow.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.7] contrast-[1.15] saturate-[1.2]"
          />
        </div>
        {/* Soft glass luminosity (light blur only) */}
        <div className="absolute inset-0 opacity-[0.28] blur-[6px] saturate-[1.25]">
          <Image
            src="/pond/pond-water-glass.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[1.05]"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_26%_20%,_rgba(100,190,165,0.2)_0%,_transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_72%_80%,_rgba(0,16,14,0.5)_0%,_transparent_55%)]" />
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

      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{ filter: `url(#${WATER_MICRO_FILTER_ID})` }}
        >
          <div className="absolute -inset-[10%] bg-[radial-gradient(ellipse_at_28%_18%,_rgba(220,245,230,0.16)_0%,_transparent_42%),_radial-gradient(ellipse_at_65%_55%,_rgba(50,130,110,0.12)_0%,_transparent_50%)]" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_56%_48%_at_11%_7%,_rgba(255,236,190,0.2)_0%,_transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_94%_90%,_rgba(0,5,4,0.55)_0%,_transparent_55%)]" />

      {/* Fast primary current — clearly visible pan */}
      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[75%] opacity-[0.48]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, -420], y: [0, -170] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-flow.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.75] contrast-[1.12]"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[60%] opacity-[0.2]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, 180], y: [0, 70] }}
          transition={{ duration: 9.5, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-dark.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.8]"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_58%_at_20%_14%,_rgba(255,245,210,0.12),_transparent_62%)]"
          animate={{ opacity: [0.35, 0.9, 0.35], scale: [1, 1.04, 1] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
