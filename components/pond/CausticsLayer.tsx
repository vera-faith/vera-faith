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

/**
 * Specular glitter locked to the stable upper-left sun.
 * Sparkles drift gently in place — never a full-screen scanning beam.
 */
export function CausticsLayer({ reducedMotion }: CausticsLayerProps) {
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 58% 48% at 16% 12%, #000 0%, #000 38%, transparent 72%)",
          maskImage:
            "radial-gradient(ellipse 58% 48% at 16% 12%, #000 0%, #000 38%, transparent 72%)",
        }}
      >
        <motion.div
          className="absolute left-[4%] top-[2%] h-[55%] w-[45%] opacity-[0.28]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(circle, rgba(255,245,210,0.75) 0px, rgba(255,235,190,0.18) 1.4px, transparent 2.8px)",
            backgroundSize: "40px 28px",
          }}
          animate={{ x: [0, -18], y: [0, 8], opacity: [0.22, 0.32, 0.22] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
