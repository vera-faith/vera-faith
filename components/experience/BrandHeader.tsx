"use client";

import { motion, AnimatePresence } from "motion/react";
import { useExperienceStore } from "@/store/experience-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function BrandHeader() {
  const phase = useExperienceStore((s) => s.phase);
  const reducedMotion = usePrefersReducedMotion();
  const browsing = phase === "browsing";

  return (
    <AnimatePresence>
      {browsing && (
        <motion.header
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col items-center px-6 pt-8 sm:pt-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.7 }}
        >
          <h1 className="font-display text-[clamp(2rem,5vw,3.4rem)] tracking-[-0.03em] text-[var(--ink)]">
            Vera Faith
          </h1>
          <p className="mt-2 font-sans text-[10px] tracking-[0.38em] text-[var(--ink-soft)] sm:text-[11px]">
            SELECTED WORKS / 2026
          </p>
          <p className="mt-1 font-sans text-[10px] tracking-[0.22em] text-[var(--ink-soft)]/70 sm:text-[11px]">
            AN INTERACTIVE RECORD COLLECTION
          </p>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
