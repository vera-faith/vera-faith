"use client";

import { motion, AnimatePresence } from "motion/react";
import { useIntroStore } from "@/store/intro-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function ListeningRoomPlaceholder() {
  const phase = useIntroStore((s) => s.phase);
  const reducedMotion = usePrefersReducedMotion();
  const visible = phase === "ready";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-6 pb-16 sm:pb-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <p className="font-sans text-[10px] tracking-[0.4em] text-[var(--amber)]/80 sm:text-xs">
              PHASE 1 PLACEHOLDER
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-[-0.02em] text-[var(--cream)] sm:text-5xl">
              Listening Room
            </h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-[var(--cream)]/55">
              The archive opens here. Project vinyls arrive in a later phase.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
