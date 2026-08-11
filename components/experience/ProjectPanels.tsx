"use client";

import { motion, AnimatePresence } from "motion/react";
import { getProjectById, getProjectIndex, projects } from "@/data/projects";
import { useExperienceStore } from "@/store/experience-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function ProjectPanels() {
  const phase = useExperienceStore((s) => s.phase);
  const selectedId = useExperienceStore((s) => s.selectedId);
  const reducedMotion = usePrefersReducedMotion();
  const project = selectedId ? getProjectById(selectedId) : null;
  const visible = phase === "playing" && !!project;
  const index = selectedId ? getProjectIndex(selectedId) : -1;

  return (
    <AnimatePresence>
      {visible && project && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.7 }}
        >
          <motion.aside
            className="glass-panel pointer-events-auto absolute left-5 top-24 max-w-[min(22rem,calc(100vw-2.5rem))] p-5 sm:left-8 sm:top-28 sm:p-6"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: reducedMotion ? 0 : 0.15,
              duration: reducedMotion ? 0.01 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="font-sans text-[10px] tracking-[0.35em] text-[var(--ink-soft)]">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
              {project.title}
            </h2>
            <p className="mt-1 font-sans text-sm text-[var(--ink-soft)]">
              {project.subtitle}
            </p>

            <dl className="mt-5 grid grid-cols-3 gap-3 font-sans text-[10px] tracking-[0.12em] text-[var(--ink)]">
              <div>
                <dt className="text-[var(--ink-soft)]">ROLE</dt>
                <dd className="mt-1 normal-case tracking-normal">{project.role}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">YEAR</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">TECH</dt>
                <dd className="mt-1 normal-case tracking-normal">
                  {project.technologies.slice(0, 2).join(", ")}
                </dd>
              </div>
            </dl>

            <p className="mt-5 font-sans text-sm leading-relaxed text-[var(--ink)]/80">
              {project.description}
            </p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--ink-soft)]">
              {project.longDescription}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/50 bg-white/30 px-2.5 py-1 font-sans text-[10px] tracking-wide text-[var(--ink)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={project.liveUrl}
                className="rounded-full border border-[var(--ink)]/15 bg-white/45 px-4 py-2 font-sans text-[10px] tracking-[0.2em] text-[var(--ink)] transition hover:bg-white/70"
              >
                LIVE SITE
              </a>
              <a
                href={project.githubUrl}
                className="rounded-full border border-[var(--ink)]/15 bg-white/25 px-4 py-2 font-sans text-[10px] tracking-[0.2em] text-[var(--ink)] transition hover:bg-white/55"
              >
                GITHUB
              </a>
            </div>
          </motion.aside>

          <motion.div
            className="glass-panel absolute bottom-28 right-5 hidden h-36 w-52 overflow-hidden p-3 sm:bottom-32 sm:right-[13.5rem] md:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reducedMotion ? 0 : 0.35,
              duration: reducedMotion ? 0.01 : 0.7,
            }}
            aria-hidden
          >
            <div
              className="h-full w-full rounded-2xl"
              style={{
                background: `linear-gradient(145deg, ${project.accentColor}, #fff8fb 55%, #dcc7ea)`,
              }}
            />
            <p className="pointer-events-none absolute bottom-5 left-5 font-sans text-[9px] tracking-[0.25em] text-[var(--ink)]/60">
              PROJECT IMAGE
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
