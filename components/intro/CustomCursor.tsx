"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIntroStore } from "@/store/intro-store";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const phase = useIntroStore((s) => s.phase);
  const isCtaHovered = useIntroStore((s) => s.isCtaHovered);

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
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  const dropping = phase === "dropping" || phase === "transitioning";
  const size = isCtaHovered ? 56 : dropping ? 18 : 28;
  const label = isCtaHovered ? "PLAY" : dropping ? "" : "";

  return (
    <AnimatePresence>
      {visible && phase !== "ready" && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed z-[100] mix-blend-difference"
          style={{ left: pos.x, top: pos.y }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="relative -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--cream)]/70"
            style={{
              width: size,
              height: size,
              background: isCtaHovered
                ? "color-mix(in oklab, var(--cherry) 35%, transparent)"
                : "transparent",
              boxShadow: isCtaHovered
                ? "0 0 24px color-mix(in oklab, var(--amber) 40%, transparent)"
                : "none",
              transition:
                "width 200ms ease, height 200ms ease, background 200ms ease, box-shadow 200ms ease",
            }}
          >
            {label ? (
              <span className="absolute inset-0 flex items-center justify-center font-sans text-[9px] font-semibold tracking-[0.2em] text-[var(--cream)]">
                {label}
              </span>
            ) : (
              <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--cream)]" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
