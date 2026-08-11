"use client";

import dynamic from "next/dynamic";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { CustomCursor } from "@/components/intro/CustomCursor";
import { ListeningRoomPlaceholder } from "@/components/intro/ListeningRoomPlaceholder";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useIntroStore } from "@/store/intro-store";

const IntroCanvas = dynamic(() => import("@/components/canvas/IntroCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[var(--near-black)]" aria-hidden />
  ),
});

export function IntroExperience() {
  const reducedMotion = usePrefersReducedMotion();
  const phase = useIntroStore((s) => s.phase);
  const parallax = usePointerParallax(
    !reducedMotion && phase !== "ready",
  );

  return (
    <section
      className="relative h-dvh w-full overflow-hidden bg-[var(--near-black)] text-[var(--cream)]"
      aria-label="Vera Faith intro experience"
    >
      <IntroCanvas parallax={parallax} reducedMotion={reducedMotion} />

      <div className="pointer-events-none absolute inset-0 z-10 vignette-layer" />
      <div className="pointer-events-none absolute inset-0 z-10 film-grain" />
      <div className="pointer-events-none absolute inset-0 z-[11] ambient-glow" />

      <IntroOverlay />
      <ListeningRoomPlaceholder />
      <CustomCursor />
    </section>
  );
}
