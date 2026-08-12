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

/** Tiny warm sparkles near the stable upper-left sun — not a sweeping beam. */
export function CausticsLayer({ reducedMotion }: CausticsLayerProps) {
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 48% at 16% 12%, #000 0%, #000 35%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 55% 48% at 16% 12%, #000 0%, #000 35%, transparent 70%)",
        }}
      >
        <motion.div
          className="absolute -inset-[10%] opacity-[0.16]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(circle, rgba(255,245,210,0.65) 0px, transparent 2.2px)",
            backgroundSize: "52px 40px",
          }}
          animate={{ x: [0, -26], y: [0, 10] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
