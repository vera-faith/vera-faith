"use client";

import { useRef } from "react";
import type { ExperiencePhase } from "@/store/experience-store";

type PhaseDurations = Partial<Record<ExperiencePhase, number>>;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Drives explicit, non-overlapping timing for a sequence of experience
 * phases so selection/reveal/return transitions cannot desync from each
 * other the way ad-hoc per-effect timers can.
 */
export function usePhaseSequence(durations: PhaseDurations) {
  const elapsedRef = useRef(0);
  const activePhaseRef = useRef<ExperiencePhase | null>(null);

  function tick(
    delta: number,
    phase: ExperiencePhase,
    onComplete: () => void,
  ) {
    if (activePhaseRef.current !== phase) {
      activePhaseRef.current = phase;
      elapsedRef.current = 0;
    }
    elapsedRef.current += delta;

    const duration = durations[phase] ?? 0;
    const linear = duration > 0 ? Math.min(1, elapsedRef.current / duration) : 1;
    const eased = easeInOutCubic(linear);

    if (linear >= 1 && duration > 0) {
      onComplete();
    }

    return eased;
  }

  function reset() {
    elapsedRef.current = 0;
    activePhaseRef.current = null;
  }

  return { tick, reset };
}
