"use client";

import { create } from "zustand";
import { projects } from "@/data/projects";

export type ExperiencePhase =
  | "browsing"
  | "selecting"
  | "revealing"
  | "awaitingNeedle"
  | "playing"
  | "returning";

type ExperienceStore = {
  phase: ExperiencePhase;
  activeIndex: number;
  selectedId: string | null;
  hoveredId: string | null;
  isTonearmHovered: boolean;
  isPlaying: boolean;
  playbackSeconds: number;
  setActiveIndex: (index: number) => void;
  setHoveredId: (id: string | null) => void;
  setTonearmHovered: (hovered: boolean) => void;
  selectProject: (id: string) => void;
  advancePhase: (phase: ExperiencePhase) => void;
  dropNeedle: () => void;
  setPlaybackSeconds: (seconds: number) => void;
  returnToCollection: () => void;
  finishReturn: () => void;
};

function wrapIndex(index: number) {
  const len = projects.length;
  return ((index % len) + len) % len;
}

export const useExperienceStore = create<ExperienceStore>((set, get) => ({
  phase: "browsing",
  activeIndex: 0,
  selectedId: null,
  hoveredId: null,
  isTonearmHovered: false,
  isPlaying: false,
  playbackSeconds: 0,
  setActiveIndex: (index) => {
    if (get().phase !== "browsing") return;
    set({ activeIndex: wrapIndex(index) });
  },
  setHoveredId: (id) => {
    if (get().phase !== "browsing") {
      set({ hoveredId: null });
      return;
    }
    set({ hoveredId: id });
  },
  setTonearmHovered: (hovered) => set({ isTonearmHovered: hovered }),
  selectProject: (id) => {
    const { phase } = get();
    if (phase !== "browsing") return;
    const index = projects.findIndex((project) => project.id === id);
    if (index < 0) return;
    set({
      phase: "selecting",
      selectedId: id,
      activeIndex: index,
      hoveredId: null,
      isPlaying: false,
      playbackSeconds: 0,
    });
  },
  advancePhase: (phase) => set({ phase }),
  dropNeedle: () => {
    const { phase } = get();
    if (phase !== "awaitingNeedle") return;
    set({ phase: "playing", isPlaying: true, playbackSeconds: 0 });
  },
  setPlaybackSeconds: (seconds) => set({ playbackSeconds: seconds }),
  returnToCollection: () => {
    const { phase } = get();
    if (
      phase !== "awaitingNeedle" &&
      phase !== "playing" &&
      phase !== "revealing"
    ) {
      return;
    }
    set({
      phase: "returning",
      isPlaying: false,
      isTonearmHovered: false,
    });
  },
  finishReturn: () =>
    set({
      phase: "browsing",
      selectedId: null,
      isPlaying: false,
      playbackSeconds: 0,
      isTonearmHovered: false,
    }),
}));
