"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BrandHeader } from "@/components/experience/BrandHeader";
import { DropNeedleHint } from "@/components/experience/DropNeedleHint";
import { BackToCollection } from "@/components/experience/BackToCollection";
import { NowPlaying } from "@/components/experience/NowPlaying";
import { ProjectPanels } from "@/components/experience/ProjectPanels";
import { CustomCursor } from "@/components/experience/CustomCursor";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useExperienceStore } from "@/store/experience-store";
import { projects } from "@/data/projects";

const ExperienceCanvas = dynamic(
  () => import("@/components/canvas/ExperienceCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[var(--ivory)]" aria-hidden />
    ),
  },
);

export function PortfolioExperience() {
  const reducedMotion = usePrefersReducedMotion();
  const phase = useExperienceStore((s) => s.phase);
  const activeIndex = useExperienceStore((s) => s.activeIndex);
  const [simplified, setSimplified] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setSimplified(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section
      className="relative h-dvh w-full overflow-hidden bg-[var(--ivory)] text-[var(--ink)]"
      aria-label="Vera Faith interactive record collection"
    >
      <ExperienceCanvas reducedMotion={reducedMotion} simplified={simplified} />

      <div className="pointer-events-none absolute inset-0 z-10 soft-haze" />
      <div className="pointer-events-none absolute inset-0 z-10 soft-vignette" />

      <BrandHeader />
      <BackToCollection />
      <DropNeedleHint />
      <ProjectPanels />
      <NowPlaying />
      <CustomCursor />

      {phase === "browsing" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center">
          <p className="font-sans text-[10px] tracking-[0.28em] text-[var(--ink-soft)]/80">
            SCROLL · DRAG · SELECT
            <span className="mx-3 text-[var(--ink-soft)]/40">·</span>
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </p>
        </div>
      )}
    </section>
  );
}
