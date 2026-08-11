"use client";

import { motion, AnimatePresence } from "motion/react";
import { useExperienceStore } from "@/store/experience-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function DropNeedleHint() {
  const phase = useExperienceStore((s) => s.phase);
  const isTonearmHovered = useExperienceStore((s) => s.isTonearmHovered);
  const dropNeedle = useExperienceStore((s) => s.dropNeedle);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {phase === "awaitingNeedle" && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-6 sm:bottom-28"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.55 }}
        >
          <button
            type="button"
            className="pointer-events-auto font-sans text-[11px] tracking-[0.42em] text-[var(--ink)]/70 transition-colors duration-300 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pink)]"
            style={{
              opacity: isTonearmHovered ? 1 : 0.72,
              transform: isTonearmHovered ? "translateY(-2px)" : "none",
            }}
            onClick={() => dropNeedle()}
          >
            DROP THE NEEDLE
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
