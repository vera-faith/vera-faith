"use client";

import { motion, AnimatePresence } from "motion/react";
import { useIntroStore } from "@/store/intro-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function IntroOverlay() {
  const phase = useIntroStore((s) => s.phase);
  const setCtaHovered = useIntroStore((s) => s.setCtaHovered);
  const dropNeedle = useIntroStore((s) => s.dropNeedle);
  const reducedMotion = usePrefersReducedMotion();

  const showChrome = phase === "idle" || phase === "hovering";
  const showCrackle = phase === "dropping" || phase === "transitioning";

  return (
    <>
      <AnimatePresence>
        {showChrome && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between px-6 py-10 sm:px-10 sm:py-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
          >
            <div className="w-full max-w-5xl text-center">
              <p className="font-sans text-[10px] font-medium tracking-[0.45em] text-[var(--amber)]/80 sm:text-xs">
                SELECTED WORKS / 2026
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.9] tracking-[-0.02em] text-[var(--cream)]">
                Vera Faith
              </h1>
            </div>

            <div className="pointer-events-auto flex flex-col items-center gap-4">
              <button
                type="button"
                className="group relative overflow-hidden border border-[var(--chrome)]/35 bg-[color-mix(in_oklab,var(--surface)_55%,transparent)] px-8 py-4 backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-[var(--amber)]/70 hover:shadow-[0_0_40px_color-mix(in_oklab,var(--cherry)_35%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--amber)]"
                onPointerEnter={() => setCtaHovered(true)}
                onPointerLeave={() => setCtaHovered(false)}
                onFocus={() => setCtaHovered(true)}
                onBlur={() => setCtaHovered(false)}
                onClick={() => dropNeedle()}
              >
                <span className="relative z-10 font-sans text-xs font-semibold tracking-[0.35em] text-[var(--cream)] sm:text-sm">
                  DROP THE NEEDLE
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 translate-y-full bg-[color-mix(in_oklab,var(--cherry)_45%,transparent)] transition-transform duration-500 group-hover:translate-y-0"
                />
              </button>
              <p className="max-w-xs text-center font-sans text-[10px] tracking-[0.18em] text-[var(--cream)]/45 sm:text-[11px]">
                ENTER THE LISTENING ROOM
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCrackle && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.4, 0.2, 0.35, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0.01 : 2.2,
              times: [0, 0.2, 0.45, 0.7, 1],
            }}
          >
            <div className="crackle-layer absolute inset-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
