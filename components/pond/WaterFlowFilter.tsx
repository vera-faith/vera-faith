"use client";

import { useEffect, useRef } from "react";

export const WATER_FLOW_FILTER_ID = "pond-water-flow";
export const WATER_MICRO_FILTER_ID = "pond-water-micro";

type WaterFlowFilterProps = {
  reducedMotion: boolean;
  onFlow?: (t: number) => void;
};

/** Shared flow clock + dual water warps: broad current + fine glassy micro-ripples. */
export function WaterFlowFilter({ reducedMotion, onFlow }: WaterFlowFilterProps) {
  const offsetWaterRef = useRef<SVGFEOffsetElement>(null);
  const offsetMicroRef = useRef<SVGFEOffsetElement>(null);

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
        offsetWaterRef.current?.setAttribute("dx", (t * 26).toFixed(2));
        offsetWaterRef.current?.setAttribute("dy", (t * 12).toFixed(2));
        offsetMicroRef.current?.setAttribute("dx", (t * 38).toFixed(2));
        offsetMicroRef.current?.setAttribute("dy", (t * 17).toFixed(2));
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
        {/* Finer warp for glassy micro-surface detail */}
        <filter id={WATER_MICRO_FILTER_ID} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={2} seed={7} result="micro" />
          <feOffset ref={offsetMicroRef} in="micro" dx="0" dy="0" result="flowingMicro" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flowingMicro"
            scale={12}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
