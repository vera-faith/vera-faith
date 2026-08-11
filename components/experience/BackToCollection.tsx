"use client";

import { motion, AnimatePresence } from "motion/react";
import { useExperienceStore } from "@/store/experience-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function BackToCollection() {
  const phase = useExperienceStore((s) => s.phase);
  const returnToCollection = useExperienceStore((s) => s.returnToCollection);
  const reducedMotion = usePrefersReducedMotion();
  const visible =
    phase === "awaitingNeedle" || phase === "playing" || phase === "revealing";

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="glass-panel pointer-events-auto absolute left-5 top-5 z-40 px-4 py-2.5 font-sans text-[10px] tracking-[0.28em] text-[var(--ink)] sm:left-8 sm:top-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.45 }}
          onClick={() => returnToCollection()}
        >
          ← BACK TO COLLECTION
        </motion.button>
      )}
    </AnimatePresence>
  );
}
