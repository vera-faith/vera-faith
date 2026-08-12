"use client";

import { useEffect, useRef } from "react";

export const WATER_FLOW_FILTER_ID = "pond-water-flow";
export const WATER_MICRO_FILTER_ID = "pond-water-micro";

type WaterFlowFilterProps = {
  reducedMotion: boolean;
  onFlow?: (t: number) => void;
};

/** Shared flow clock + smoother dual water warps (keep flowing, less glitchy). */
export function WaterFlowFilter({ reducedMotion, onFlow }: WaterFlowFilterProps) {
  const offsetWaterRef = useRef<SVGFEOffsetElement>(null);
  const offsetMicroRef = useRef<SVGFEOffsetElement>(null);
  const onFlowRef = useRef(onFlow);

  useEffect(() => {
    onFlowRef.current = onFlow;
  }, [onFlow]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    let lastFilterUpdate = 0;
    // Faster updates + lower scale = smoother liquid, less stepped warp
    const FILTER_MS = 48;

    function tick() {
      const now = performance.now();
      const t = (now - start) / 1000;
      if (now - lastFilterUpdate >= FILTER_MS) {
        lastFilterUpdate = now;
        // Smooth continuous pan of the displacement noise
        offsetWaterRef.current?.setAttribute("dx", (t * 26).toFixed(2));
        offsetWaterRef.current?.setAttribute("dy", (t * 15).toFixed(2));
        offsetMicroRef.current?.setAttribute("dx", (t * 36).toFixed(2));
        offsetMicroRef.current?.setAttribute("dy", (t * 20).toFixed(2));
      }
      onFlowRef.current?.(t);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden focusable="false">
      <defs>
        <filter id={WATER_FLOW_FILTER_ID} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          {/* Lower frequency + softer scale = less glitchy tiling */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0024 0.0042"
            numOctaves={2}
            seed={3}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="0.6" result="softNoise" />
          <feOffset ref={offsetWaterRef} in="softNoise" dx="0" dy="0" result="flowingNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flowingNoise"
            scale={52}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={WATER_MICRO_FILTER_ID} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.014" numOctaves={1} seed={7} result="micro" />
          <feGaussianBlur in="micro" stdDeviation="0.4" result="softMicro" />
          <feOffset ref={offsetMicroRef} in="softMicro" dx="0" dy="0" result="flowingMicro" />
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
