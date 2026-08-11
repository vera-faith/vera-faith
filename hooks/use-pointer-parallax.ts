"use client";

import { useEffect, useRef } from "react";

export type ParallaxTarget = {
  x: number;
  y: number;
};

export function usePointerParallax(enabled = true) {
  const target = useRef<ParallaxTarget>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      target.current = { x: 0, y: 0 };
      return;
    }

    function onPointerMove(event: PointerEvent) {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: nx, y: ny };
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [enabled]);

  return target;
}
