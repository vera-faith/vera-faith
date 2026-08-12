"use client";

import { useEffect, useRef } from "react";

export const WATER_FLOW_FILTER_ID = "pond-water-flow";
export const WATER_MICRO_FILTER_ID = "pond-water-micro";

type WaterFlowFilterProps = {
  reducedMotion: boolean;
  onFlow?: (t: number) => void;
};

/** Shared flow clock + dual water warps. onFlow is read via ref so parent
 * re-renders never restart the animation loop. */
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
    const FILTER_MS = 100;

    function tick() {
      const now = performance.now();
      const t = (now - start) / 1000;
      if (now - lastFilterUpdate >= FILTER_MS) {
        lastFilterUpdate = now;
        offsetWaterRef.current?.setAttribute("dx", (t * 38).toFixed(2));
        offsetWaterRef.current?.setAttribute("dy", (t * 22).toFixed(2));
        offsetMicroRef.current?.setAttribute("dx", (t * 54).toFixed(2));
        offsetMicroRef.current?.setAttribute("dy", (t * 30).toFixed(2));
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
        <filter id={WATER_FLOW_FILTER_ID} x="-18%" y="-18%" width="136%" height="136%">
          <feTurbulence type="turbulence" baseFrequency="0.0032 0.0058" numOctaves={1} seed={3} result="noise" />
          <feOffset ref={offsetWaterRef} in="noise" dx="0" dy="0" result="flowingNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flowingNoise"
            scale={72}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={WATER_MICRO_FILTER_ID} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves={2} seed={7} result="micro" />
          <feOffset ref={offsetMicroRef} in="micro" dx="0" dy="0" result="flowingMicro" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flowingMicro"
            scale={18}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
