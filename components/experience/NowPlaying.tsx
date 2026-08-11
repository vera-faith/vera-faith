"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getProjectById } from "@/data/projects";
import { useExperienceStore } from "@/store/experience-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function NowPlaying() {
  const phase = useExperienceStore((s) => s.phase);
  const selectedId = useExperienceStore((s) => s.selectedId);
  const isPlaying = useExperienceStore((s) => s.isPlaying);
  const playbackSeconds = useExperienceStore((s) => s.playbackSeconds);
  const setPlaybackSeconds = useExperienceStore((s) => s.setPlaybackSeconds);
  const reducedMotion = usePrefersReducedMotion();

  const project = selectedId ? getProjectById(selectedId) : null;
  const visible = phase === "playing" && !!project;

  useEffect(() => {
    if (!isPlaying || !project) return;

    let audio: HTMLAudioElement | null = null;

    if (project.audioUrl) {
      audio = new Audio(project.audioUrl);
      audio.volume = 0.7;
      void audio.play().catch(() => undefined);
    }

    const interval = window.setInterval(() => {
      const current = useExperienceStore.getState().playbackSeconds;
      setPlaybackSeconds(Math.min(project.durationSeconds, current + 0.25));
    }, 250);

    return () => {
      window.clearInterval(interval);
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [isPlaying, project, setPlaybackSeconds]);

  return (
    <AnimatePresence>
      {visible && project && (
        <motion.div
          className="glass-panel pointer-events-none absolute bottom-6 right-5 z-40 min-w-[180px] px-4 py-3 sm:bottom-8 sm:right-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
        >
          <p className="font-sans text-[9px] tracking-[0.32em] text-[var(--ink-soft)]">
            NOW PLAYING
          </p>
          <p className="mt-1 font-display text-lg text-[var(--ink)]">
            {project.title}
          </p>
          <p className="mt-0.5 font-sans text-[10px] text-[var(--ink-soft)]">
            {project.songTitle}
          </p>
          <p className="mt-2 font-sans text-[10px] tabular-nums tracking-wide text-[var(--ink)]/70">
            {formatTime(playbackSeconds)} / {formatTime(project.durationSeconds)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
