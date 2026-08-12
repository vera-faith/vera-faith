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

/** Warm shimmer from the single upper-left sun — no diagonal beams. */
export function CausticsLayer({ reducedMotion }: CausticsLayerProps) {
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Mask shimmer toward the lit side of the pond */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 22% 18%, #000 0%, #000 40%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 22% 18%, #000 0%, #000 40%, transparent 75%)",
        }}
      >
        <motion.div
          className="absolute -inset-[15%] opacity-[0.22]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(circle, rgba(255,245,210,0.7) 0px, rgba(255,235,190,0.15) 1.5px, transparent 3px)",
            backgroundSize: "44px 32px",
          }}
          animate={{ x: [0, -40], y: [0, 14] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-[15%] opacity-[0.12]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(circle, rgba(255,250,230,0.55) 0px, transparent 2.5px)",
            backgroundSize: "68px 50px",
          }}
          animate={{ x: [0, 28], y: [0, -20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
