"use client";

/**
 * Subtle shared-surface skim under the flora layer.
 * Intentionally has NO traveling light band / scanning streak.
 */
export function WaterGlaze({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08]" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/pond/pond-water-dark.jpg)",
          backgroundSize: "120% 120%",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
