"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID, WATER_MICRO_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/** Deep emerald glassy pond — continuous down-right current, visible depth. */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020e0c]">
      <div
        className="absolute -inset-[20%]"
        style={{
          filter: reducedMotion ? undefined : `url(#${WATER_FLOW_FILTER_ID})`,
        }}
      >
        {/* Primary glass water — rich emerald / teal depth */}
        <Image
          src="/pond/pond-water-glass.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.7] contrast-[1.3] saturate-[1.4]"
        />
        {/* Reference mood wash — deep emerald / caustic structure */}
        <div className="absolute inset-0 opacity-[0.42] mix-blend-soft-light">
          <Image
            src="/pond/pond-mood-ref.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.85] contrast-[1.1] saturate-[1.2]"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.5] mix-blend-soft-light">
          <Image
            src="/pond/pond-water-flow.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.62] contrast-[1.22] saturate-[1.3]"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.35]">
          <Image
            src="/pond/pond-water-dark.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.55] contrast-[1.15]"
          />
        </div>
        {/* Depth: lit upper-left → deep moody lower-right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_58%_at_18%_12%,_rgba(70,160,140,0.22)_0%,_transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_78%_88%,_rgba(0,10,12,0.72)_0%,_transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,_rgba(20,70,60,0.12)_0%,_transparent_40%,_rgba(0,8,10,0.35)_100%)]" />
        <div className="absolute inset-0 opacity-[0.18]">
          <Image
            src="/pond/pond-reflection.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-[3px] brightness-[0.7]"
          />
        </div>
      </div>

      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.38]"
          style={{ filter: `url(#${WATER_MICRO_FILTER_ID})` }}
        >
          <div className="absolute -inset-[12%] bg-[radial-gradient(ellipse_at_22%_14%,_rgba(180,230,210,0.14)_0%,_transparent_44%),_radial-gradient(ellipse_at_70%_60%,_rgba(25,80,70,0.18)_0%,_transparent_52%)]" />
        </div>
      )}

      {/* Stable sun pool — upper left, no scanning bars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_52%_44%_at_12%_8%,_rgba(255,236,195,0.18)_0%,_transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_92%_92%,_rgba(0,4,6,0.62)_0%,_transparent_55%)]" />

      {/* Primary current sheet — down-right */}
      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[80%] opacity-[0.42] mix-blend-soft-light"
          style={{ willChange: "transform" }}
          animate={{ x: [0, 420], y: [0, 260] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-flow.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.7] contrast-[1.18] saturate-[1.15]"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[65%] opacity-[0.22] mix-blend-overlay"
          style={{ willChange: "transform" }}
          animate={{ x: [0, 200], y: [0, 130] }}
          transition={{ duration: 11.5, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-glass.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.75]"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_55%_at_16%_10%,_rgba(255,245,210,0.1),_transparent_64%)]"
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
