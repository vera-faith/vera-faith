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

/** Full-pond caustic shimmer — sun-biased, never scanning beams. */
export function CausticsLayer({ reducedMotion }: CausticsLayerProps) {
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Strong upper-left caustics */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 18% 14%, #000 0%, #000 48%, transparent 82%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 18% 14%, #000 0%, #000 48%, transparent 82%)",
        }}
      >
        <motion.div
          className="absolute -inset-[16%] opacity-[0.38]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(ellipse 48% 18%, rgba(255,248,220,0.6) 0%, transparent 68%), radial-gradient(circle, rgba(255,252,235,0.65) 0px, transparent 2.4px)",
            backgroundSize: "92px 50px, 32px 26px",
          }}
          animate={{ x: [0, -34], y: [0, 22] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-[16%] opacity-[0.22]"
          style={{
            ...LAYER,
            backgroundImage:
              "radial-gradient(circle, rgba(190,235,220,0.55) 0px, transparent 2.2px)",
            backgroundSize: "46px 36px",
          }}
          animate={{ x: [0, 30], y: [0, -16] }}
          transition={{ duration: 9.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Soft caustics across rest of pond so top/bottom match */}
      <motion.div
        className="absolute -inset-[12%] opacity-[0.14]"
        style={{
          ...LAYER,
          backgroundImage:
            "radial-gradient(circle, rgba(220,245,235,0.75) 0px, transparent 2px)",
          backgroundSize: "56px 42px",
        }}
        animate={{ x: [0, -26], y: [0, 16] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -inset-[12%] opacity-[0.1]"
        style={{
          ...LAYER,
          backgroundImage:
            "radial-gradient(ellipse 40% 16%, rgba(255,245,210,0.4) 0%, transparent 70%)",
          backgroundSize: "120px 70px",
        }}
        animate={{ x: [0, 18], y: [0, -12] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
