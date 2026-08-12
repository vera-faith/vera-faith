"use client";

import { useEffect, useRef } from "react";

export const WATER_FLOW_FILTER_ID = "pond-water-flow";

type WaterFlowFilterProps = {
  reducedMotion: boolean;
  onFlow?: (t: number) => void;
};

/** Shared flow clock + water-surface displacement. */
export function WaterFlowFilter({ reducedMotion, onFlow }: WaterFlowFilterProps) {
  const offsetWaterRef = useRef<SVGFEOffsetElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    let lastFilterUpdate = 0;
    const FILTER_MS = 140;

    function tick() {
      const now = performance.now();
      const t = (now - start) / 1000;
      if (now - lastFilterUpdate >= FILTER_MS) {
        lastFilterUpdate = now;
        offsetWaterRef.current?.setAttribute("dx", (t * 20).toFixed(2));
        offsetWaterRef.current?.setAttribute("dy", (t * 9).toFixed(2));
      }
      onFlow?.(t);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, onFlow]);

  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden focusable="false">
      <defs>
        <filter id={WATER_FLOW_FILTER_ID} x="-14%" y="-14%" width="128%" height="128%">
          <feTurbulence type="turbulence" baseFrequency="0.003 0.0055" numOctaves={1} seed={3} result="noise" />
          <feOffset ref={offsetWaterRef} in="noise" dx="0" dy="0" result="flowingNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flowingNoise"
            scale={46}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
