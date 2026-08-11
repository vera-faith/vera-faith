"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useExperienceStore } from "@/store/experience-store";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const phase = useExperienceStore((s) => s.phase);
  const hoveredId = useExperienceStore((s) => s.hoveredId);
  const isTonearmHovered = useExperienceStore((s) => s.isTonearmHovered);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!finePointer) return;

    function onMove(event: PointerEvent) {
      setPos({ x: event.clientX, y: event.clientY });
      setVisible(true);
    }

    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  const active = !!hoveredId || isTonearmHovered;
  const size = active ? 52 : 22;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed z-[100]"
          style={{ left: pos.x, top: pos.y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--ink)]/35 bg-white/25 backdrop-blur-[2px]"
            style={{
              width: size,
              height: size,
              boxShadow: active
                ? "0 8px 30px rgba(232, 183, 198, 0.35)"
                : "0 4px 16px rgba(58, 49, 64, 0.08)",
              transition:
                "width 220ms ease, height 220ms ease, box-shadow 220ms ease",
            }}
          >
            {phase === "awaitingNeedle" && isTonearmHovered ? (
              <span className="absolute inset-0 flex items-center justify-center font-sans text-[8px] font-semibold tracking-[0.18em] text-[var(--ink)]">
                PLAY
              </span>
            ) : (
              <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)]/70" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
