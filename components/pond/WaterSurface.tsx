"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID, WATER_MICRO_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/** Glassy emerald pond — visible liquid surface, continuous down-right current. */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020e0c]">
      <div
        className="absolute -inset-[20%]"
        style={{
          filter: reducedMotion ? undefined : `url(#${WATER_FLOW_FILTER_ID})`,
        }}
      >
        <Image
          src="/pond/pond-water-glass.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.78] contrast-[1.32] saturate-[1.45]"
        />
        <div className="absolute inset-0 opacity-[0.48] mix-blend-soft-light">
          <Image
            src="/pond/pond-mood-ref.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.9] contrast-[1.12] saturate-[1.25]"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.55] mix-blend-soft-light">
          <Image
            src="/pond/pond-water-flow.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.7] contrast-[1.25] saturate-[1.35]"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.28]">
          <Image
            src="/pond/pond-water-dark.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.5] contrast-[1.2]"
          />
        </div>
        {/* Lit upper-left → deep lower-right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_16%_10%,_rgba(90,180,155,0.28)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_82%_90%,_rgba(0,8,10,0.68)_0%,_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(148deg,_rgba(30,90,75,0.14)_0%,_transparent_38%,_rgba(0,6,8,0.4)_100%)]" />
        <div className="absolute inset-0 opacity-[0.22]">
          <Image
            src="/pond/pond-reflection.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-[2px] brightness-[0.75]"
          />
        </div>
      </div>

      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.42]"
          style={{ filter: `url(#${WATER_MICRO_FILTER_ID})` }}
        >
          <div className="absolute -inset-[12%] bg-[radial-gradient(ellipse_at_20%_12%,_rgba(200,240,220,0.18)_0%,_transparent_42%),_radial-gradient(ellipse_at_68%_58%,_rgba(30,90,75,0.16)_0%,_transparent_50%)]" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_48%_at_11%_7%,_rgba(255,238,200,0.22)_0%,_transparent_66%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_94%_94%,_rgba(0,3,5,0.58)_0%,_transparent_52%)]" />

      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[80%] opacity-[0.5] mix-blend-soft-light"
          style={{ willChange: "transform" }}
          animate={{ x: [0, 440], y: [0, 270] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-flow.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.78] contrast-[1.2] saturate-[1.2]"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[65%] opacity-[0.26] mix-blend-overlay"
          style={{ willChange: "transform" }}
          animate={{ x: [0, 210], y: [0, 140] }}
          transition={{ duration: 10.5, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-glass.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.82]"
          />
        </motion.div>
      )}

      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_58%_at_14%_8%,_rgba(255,248,220,0.14),_transparent_62%)]"
          animate={{ opacity: [0.45, 0.95, 0.45] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
