"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { WATER_FLOW_FILTER_ID, WATER_MICRO_FILTER_ID } from "@/components/pond/WaterFlowFilter";

type WaterSurfaceProps = {
  reducedMotion: boolean;
};

/**
 * Premium clear glassy emerald pond — depth, luminosity, continuous current.
 * Quality target: match the polish of the lotus/pad sprites.
 */
export function WaterSurface({ reducedMotion }: WaterSurfaceProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#010a08]">
      {/* Broad displaced water body */}
      <div
        className="absolute -inset-[16%]"
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
          className="object-cover brightness-[0.72] contrast-[1.2] saturate-[1.25]"
        />

        {/* Glassy clarity wash — soft teal luminosity (blurred so no plant ghosts) */}
        <div className="absolute inset-0 opacity-[0.42] blur-[20px] saturate-[1.35]">
          <Image
            src="/pond/pond-water-glass.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[1.08]"
          />
        </div>

        {/* Clearer mid-water glass tint */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_28%_22%,_rgba(90,180,155,0.18)_0%,_rgba(40,110,95,0.08)_40%,_transparent_70%)]" />
        {/* Deep underwater volume */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_70%_78%,_rgba(0,18,16,0.55)_0%,_transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_55%_45%,_rgba(20,70,60,0.2)_0%,_transparent_65%)]" />

        {/* Soft sky/canopy reflection — very low, keeps glass mood */}
        <div className="absolute inset-0 opacity-[0.12]">
          <Image
            src="/pond/pond-reflection.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-[3px] brightness-[0.9]"
          />
        </div>
      </div>

      {/* Micro glassy ripple layer */}
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ filter: `url(#${WATER_MICRO_FILTER_ID})` }}
        >
          <div className="absolute -inset-[8%] bg-[radial-gradient(ellipse_at_30%_20%,_rgba(210,240,225,0.14)_0%,_transparent_45%),_radial-gradient(ellipse_at_70%_60%,_rgba(60,140,120,0.1)_0%,_transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(118deg, transparent 0px, transparent 11px, rgba(200,235,220,0.04) 12px, transparent 13px)",
            }}
          />
        </div>
      )}

      {/* Stable cinematic sun — fixed upper-left */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_11%_7%,_rgba(255,236,190,0.22)_0%,_rgba(170,220,200,0.07)_38%,_transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_94%_90%,_rgba(0,5,4,0.58)_0%,_transparent_55%)]" />

      {/* Primary current sheet — clear glass texture flowing */}
      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[70%] opacity-[0.36]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, -360], y: [0, -145] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-dark.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-[0.78] contrast-[1.1] saturate-[1.15]"
          />
        </motion.div>
      )}

      {/* Slower counter swirl */}
      {!reducedMotion && (
        <motion.div
          className="absolute -inset-[55%] opacity-[0.14]"
          style={{ willChange: "transform" }}
          animate={{ x: [0, 150], y: [0, 60] }}
          transition={{ duration: 11.5, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/pond/pond-water-glass.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-[10px] brightness-[0.85] saturate-[1.2]"
          />
        </motion.div>
      )}

      {/* Glass sheen plate — soft clarity boost across surface */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(210,240,230,0.07)_0%,transparent_35%,transparent_60%,rgba(0,30,25,0.18)_100%)]" />

      {/* Vertical swell — pond breathes */}
      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_58%_at_20%_14%,_rgba(255,245,210,0.1),_transparent_62%)]"
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.03, 1] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
