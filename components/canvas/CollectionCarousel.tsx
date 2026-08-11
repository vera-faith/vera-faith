"use client";

import type { RefObject } from "react";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { RecordCover } from "@/components/canvas/RecordCover";
import { useCarouselScroll } from "@/hooks/use-carousel-scroll";
import { useExperienceStore } from "@/store/experience-store";

type CollectionCarouselProps = {
  reducedMotion: boolean;
  sleeveAnchorRef: RefObject<THREE.Object3D | null>;
};

export function CollectionCarousel({
  reducedMotion,
  sleeveAnchorRef,
}: CollectionCarouselProps) {
  const phase = useExperienceStore((s) => s.phase);
  const { positionRef, suppressClickRef } = useCarouselScroll({
    count: projects.length,
    enabled: phase === "browsing",
    reducedMotion,
  });

  return (
    <group position={[0, 0.15, 0]}>
      {projects.map((project, index) => (
        <RecordCover
          key={project.id}
          project={project}
          index={index}
          count={projects.length}
          reducedMotion={reducedMotion}
          scrollPositionRef={positionRef}
          suppressClickRef={suppressClickRef}
          sleeveAnchorRef={sleeveAnchorRef}
        />
      ))}
    </group>
  );
}
