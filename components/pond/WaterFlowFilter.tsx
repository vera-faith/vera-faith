"use client";

import { useEffect, useRef } from "react";

export const WATER_FLOW_FILTER_ID = "pond-water-flow";

type WaterFlowFilterProps = {
  reducedMotion: boolean;
  onFlow?: (t: number) => void;
};

/** Shared pond clock + stronger surface displacement (dominant water motion). */
export function WaterFlowFilter({ reducedMotion, onFlow }: WaterFlowFilterProps) {
  const offsetWaterRef = useRef<SVGFEOffsetElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    let lastFilterUpdate = 0;
    const FILTER_MS = 120;

    function tick() {
      const now = performance.now();
      const t = (now - start) / 1000;
      if (now - lastFilterUpdate >= FILTER_MS) {
        lastFilterUpdate = now;
        // Faster noise pan = clearly visible continuous current
        offsetWaterRef.current?.setAttribute("dx", (t * 28).toFixed(2));
        offsetWaterRef.current?.setAttribute("dy", (t * 12).toFixed(2));
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
        <filter id={WATER_FLOW_FILTER_ID} x="-16%" y="-16%" width="132%" height="132%">
          <feTurbulence type="turbulence" baseFrequency="0.0028 0.005" numOctaves={1} seed={3} result="noise" />
          <feOffset ref={offsetWaterRef} in="noise" dx="0" dy="0" result="flowingNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flowingNoise"
            scale={58}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
