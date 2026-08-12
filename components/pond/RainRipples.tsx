"use client";

import { useEffect, useRef } from "react";

export type PlantAnchor = {
  /** Center x as fraction of viewport width (0–1) */
  nx: number;
  /** Center y as fraction of viewport height (0–1) */
  ny: number;
  /** Approx radius in viewport-min fraction */
  radius: number;
};

type RainRipplesProps = {
  reducedMotion: boolean;
  /** Plant positions so ripples form around silhouettes, not ignore them */
  anchors?: readonly PlantAnchor[];
};

type Ripple = {
  x: number;
  y: number;
  born: number;
  life: number;
  maxRadius: number;
  strength: number;
  /** Aspect > 1 stretches horizontally — reads as water-surface ellipse */
  aspect: number;
};

/** Soft pond disturbances — denser around plant edges so water wraps flora. */
export function RainRipples({ reducedMotion, anchors = [] }: RainRipplesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const ripples: Ripple[] = [];
    let nextTiny = performance.now() + 280;
    let nextEdge = performance.now() + 400;
    let nextOpen = performance.now() + 1600;

    function spawn(
      x: number,
      y: number,
      strength: number,
      life: number,
      maxRadius: number,
      aspect = 1.35,
    ) {
      if (ripples.length > 28) ripples.shift();
      ripples.push({ x, y, born: performance.now(), life, maxRadius, strength, aspect });
    }

    function spawnNearAnchor() {
      if (!anchors.length || width <= 0) return;
      const a = anchors[Math.floor(Math.random() * anchors.length)];
      const angle = Math.random() * Math.PI * 2;
      const edge = a.radius * Math.min(width, height) * (0.7 + Math.random() * 0.5);
      const x = a.nx * width + Math.cos(angle) * edge;
      const y = a.ny * height + Math.sin(angle) * edge * 0.7;
      spawn(x, y, 0.18 + Math.random() * 0.12, 1.4 + Math.random() * 0.7, 5 + Math.random() * 7, 1.4);
    }

    function onPointerDown(event: PointerEvent) {
      spawn(event.clientX, event.clientY, 0.35, 1.8, 12 + Math.random() * 6, 1.35);
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    for (let i = 0; i < 6; i++) spawnNearAnchor();
    for (let i = 0; i < 3; i++) {
      spawn(
        Math.random() * width,
        Math.random() * height,
        0.12 + Math.random() * 0.1,
        1.4,
        4 + Math.random() * 5,
      );
    }

    let raf = 0;
    function tick() {
      const now = performance.now();

      if (now >= nextEdge) {
        spawnNearAnchor();
        if (Math.random() > 0.5) spawnNearAnchor();
        nextEdge = now + 380 + Math.random() * 480;
      }

      if (now >= nextTiny) {
        spawn(
          Math.random() * width,
          Math.random() * height,
          0.1 + Math.random() * 0.1,
          1.2 + Math.random() * 0.5,
          3 + Math.random() * 5,
        );
        nextTiny = now + 400 + Math.random() * 500;
      }

      if (now >= nextOpen) {
        spawn(
          Math.random() * width,
          Math.random() * height,
          0.14 + Math.random() * 0.08,
          1.6 + Math.random() * 0.4,
          6 + Math.random() * 5,
        );
        nextOpen = now + 1800 + Math.random() * 1400;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        const t = Math.min(1, Math.max(0, age / r.life));
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }

        const eased = 1 - Math.pow(1 - t, 2.2);
        const radius = Math.max(0, eased * r.maxRadius);
        const fade = (1 - t) * (1 - t) * 0.22 * r.strength;

        ctx!.save();
        ctx!.translate(r.x, r.y);
        ctx!.scale(r.aspect, 1);
        ctx!.beginPath();
        ctx!.arc(0, 0, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(205, 235, 220, ${fade})`;
        ctx!.lineWidth = 0.7;
        ctx!.stroke();
        ctx!.restore();
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [reducedMotion, anchors]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-45"
      aria-hidden
    />
  );
}
