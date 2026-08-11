"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/experience-store";

type UseCarouselScrollOptions = {
  count: number;
  enabled: boolean;
  reducedMotion: boolean;
};

const DRAG_SENSITIVITY = 0.0034;
const WHEEL_SENSITIVITY = 0.0048;
const FRICTION = 5.5;
const SNAP_VELOCITY_THRESHOLD = 0.035;
const SNAP_STRENGTH = 9;
const CLICK_MOVEMENT_GUARD_PX = 6;

function normalizeWheelDelta(event: WheelEvent) {
  let delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (event.deltaMode === 1) delta *= 18;
  else if (event.deltaMode === 2) delta *= 420;
  return THREE.MathUtils.clamp(delta, -90, 90);
}

/**
 * Owns a continuous scroll position for the record-cover carousel.
 * Position lives in a ref (never in React state) so browsing never triggers
 * a re-render; the rounded index is only published to Zustand when it
 * actually changes, purely to drive UI readouts.
 */
export function useCarouselScroll({
  count,
  enabled,
  reducedMotion,
}: UseCarouselScrollOptions) {
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const { gl } = useThree();

  const setActiveIndex = useExperienceStore((s) => s.setActiveIndex);
  const lastPublishedIndex = useRef(-1);

  useEffect(() => {
    positionRef.current = useExperienceStore.getState().activeIndex;
    lastPublishedIndex.current = useExperienceStore.getState().activeIndex;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const el = gl.domElement;

    let lastPointerX = 0;
    let dragMoved = 0;
    let history: Array<{ x: number; t: number }> = [];
    let activePointerId: number | null = null;

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const delta = normalizeWheelDelta(event);
      velocityRef.current += delta * WHEEL_SENSITIVITY;
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button !== undefined && event.button !== 0) return;
      isDraggingRef.current = true;
      suppressClickRef.current = false;
      activePointerId = event.pointerId;
      lastPointerX = event.clientX;
      dragMoved = 0;
      velocityRef.current = 0;
      history = [{ x: event.clientX, t: performance.now() }];
      el.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent) {
      if (!isDraggingRef.current || event.pointerId !== activePointerId) return;
      const dx = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      dragMoved += Math.abs(dx);
      positionRef.current -= dx * DRAG_SENSITIVITY;

      history.push({ x: event.clientX, t: performance.now() });
      if (history.length > 6) history.shift();
    }

    function endDrag(event: PointerEvent) {
      if (!isDraggingRef.current || event.pointerId !== activePointerId) return;
      isDraggingRef.current = false;
      activePointerId = null;
      suppressClickRef.current = dragMoved > CLICK_MOVEMENT_GUARD_PX;

      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0.001) {
          const pxPerSecond = (last.x - first.x) / dt;
          velocityRef.current = -pxPerSecond * DRAG_SENSITIVITY;
        }
      }

      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // capture may already be released
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        velocityRef.current += 2.4;
      } else if (event.key === "ArrowLeft") {
        velocityRef.current -= 2.4;
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, gl]);

  useFrame((_, rawDelta) => {
    if (!enabled) return;
    const delta = Math.min(rawDelta, 1 / 30);

    if (reducedMotion) {
      velocityRef.current = 0;
      positionRef.current = Math.round(positionRef.current);
    } else if (!isDraggingRef.current) {
      // Exponential friction, frame-rate independent.
      velocityRef.current *= Math.exp(-FRICTION * delta);
      positionRef.current += velocityRef.current * delta;

      if (Math.abs(velocityRef.current) < SNAP_VELOCITY_THRESHOLD) {
        const target = Math.round(positionRef.current);
        const diff = target - positionRef.current;
        positionRef.current += diff * Math.min(1, SNAP_STRENGTH * delta);
        if (Math.abs(diff) < 0.0008) {
          positionRef.current = target;
          velocityRef.current = 0;
        }
      }
    }

    // Wrap into [0, count) while preserving direction of travel.
    positionRef.current = ((positionRef.current % count) + count) % count;

    const rounded = Math.round(positionRef.current) % count;
    if (rounded !== lastPublishedIndex.current) {
      lastPublishedIndex.current = rounded;
      setActiveIndex(rounded);
    }
  });

  return { positionRef, isDraggingRef, suppressClickRef };
}
