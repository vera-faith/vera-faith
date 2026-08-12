"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";

type CausticsLayerProps = {
  reducedMotion: boolean;
};

const LAYER: CSSProperties = {
  willChange: "transform",
  transform: "translateZ(0)",
};

/** Broader glassy caustic shimmer — still sun-biased, never a scanning beam. */
export function CausticsLayer({ reducedMotion }: CausticsLayerProps) {
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 20% 18%, #000 0%, #000 42%, transparent 78%)",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 20% 18%, #000 0%, #000 42%, transparent 78%)",
        }}
      >
        <motion.div
          className="absolute -inset-[14%] opacity-[0.28]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(ellipse 50% 20%, rgba(255,248,220,0.55) 0%, transparent 68%), radial-gradient(circle, rgba(255,252,235,0.55) 0px, transparent 2.2px)",
            backgroundSize: "100px 55px, 36px 28px",
          }}
          animate={{ x: [0, -28], y: [0, 18] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-[14%] opacity-[0.16]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(circle, rgba(190,235,220,0.5) 0px, transparent 2.4px)",
            backgroundSize: "52px 40px",
          }}
          animate={{ x: [0, 26], y: [0, -18] }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Soft full-pond glass glints — very low, adds clarity everywhere */}
      <motion.div
        className="absolute -inset-[10%] opacity-[0.08]"
        style={{
          ...LAYER,
          backgroundImage:
            "radial-gradient(circle, rgba(220,245,235,0.7) 0px, transparent 1.8px)",
          backgroundSize: "64px 48px",
        }}
        animate={{ x: [0, -20], y: [0, 8] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
