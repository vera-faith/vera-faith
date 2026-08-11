"use client";

import { create } from "zustand";

export type IntroPhase =
  | "idle"
  | "hovering"
  | "dropping"
  | "transitioning"
  | "ready";

type IntroStore = {
  phase: IntroPhase;
  isCtaHovered: boolean;
  setPhase: (phase: IntroPhase) => void;
  setCtaHovered: (hovered: boolean) => void;
  dropNeedle: () => void;
  reset: () => void;
};

export const useIntroStore = create<IntroStore>((set, get) => ({
  phase: "idle",
  isCtaHovered: false,
  setPhase: (phase) => set({ phase }),
  setCtaHovered: (hovered) => {
    const { phase } = get();
    if (phase !== "idle" && phase !== "hovering") {
      set({ isCtaHovered: false });
      return;
    }
    set({
      isCtaHovered: hovered,
      phase: hovered ? "hovering" : "idle",
    });
  },
  dropNeedle: () => {
    const { phase } = get();
    if (phase !== "idle" && phase !== "hovering") return;
    set({ phase: "dropping", isCtaHovered: false });
  },
  reset: () => set({ phase: "idle", isCtaHovered: false }),
}));
