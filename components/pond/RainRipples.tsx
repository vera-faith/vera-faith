"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

export type PlantAnchor = {
  nx: number;
  ny: number;
  radius: number;
  tint?: "pink" | "green";
};

type RainRipplesProps = {
  reducedMotion: boolean;
  anchors?: readonly PlantAnchor[];
  flowTimeRef?: MutableRefObject<number>;
};

type FreeRipple = {
  x: number;
  y: number;
  born: number;
  life: number;
  maxRadius: number;
  strength: number;
  aspect: number;
};

/** Visible living ripples — plant-edge wakes + open-water waves. */
export function RainRipples({ reducedMotion, anchors = [], flowTimeRef }: RainRipplesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
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

    const free: FreeRipple[] = [];
    let nextFree = performance.now() + 200;
    let nextWave = performance.now() + 100;

    function spawnFree(x: number, y: number, strength: number, life: number, maxRadius: number) {
      if (free.length > 48) free.shift();
      free.push({
        x,
        y,
        born: performance.now(),
        life,
        maxRadius,
        strength,
        aspect: 1.35 + Math.random() * 0.25,
      });
    }

    // Seed visible ripples immediately
    for (let i = 0; i < 12; i++) {
      spawnFree(
        Math.random() * Math.max(width, 1),
        Math.random() * Math.max(height, 1),
        0.35 + Math.random() * 0.25,
        2 + Math.random(),
        18 + Math.random() * 28,
      );
    }
    for (const a of anchors) {
      const cx = a.nx * Math.max(width, 1);
      const cy = a.ny * Math.max(height, 1);
      spawnFree(cx + 20, cy, 0.4, 2.2, 22);
    }

    function onPointerDown(event: PointerEvent) {
      spawnFree(event.clientX, event.clientY, 0.55, 2.4, 28);
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    let raf = 0;
    function tick() {
      const now = performance.now();
      const t = flowTimeRef?.current ?? now / 1000;
      const minDim = Math.min(width, height) || 1;

      if (now >= nextFree) {
        spawnFree(
          Math.random() * width,
          Math.random() * height,
          0.22 + Math.random() * 0.2,
          1.6 + Math.random() * 0.9,
          10 + Math.random() * 18,
        );
        if (anchors.length) {
          const a = anchors[Math.floor(Math.random() * anchors.length)];
          const ang = Math.random() * Math.PI * 2;
          const edge = a.radius * minDim * (0.8 + Math.random() * 0.6);
          spawnFree(
            a.nx * width + Math.cos(ang) * edge,
            a.ny * height + Math.sin(ang) * edge * 0.7,
            0.35 + Math.random() * 0.25,
            1.8 + Math.random(),
            14 + Math.random() * 20,
          );
        }
        nextFree = now + 160 + Math.random() * 220;
      }

      if (now >= nextWave) {
        // Broad soft swell rings in open water
        spawnFree(
          Math.random() * width,
          Math.random() * height,
          0.18 + Math.random() * 0.12,
          2.8 + Math.random(),
          40 + Math.random() * 50,
        );
        nextWave = now + 700 + Math.random() * 900;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      // Continuous silhouette wakes — clearly visible
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const cx = a.nx * width;
        const cy = a.ny * height;
        const baseR = Math.max(22, a.radius * minDim * 1.15);
        const stroke = a.tint === "pink" ? "235, 190, 210" : "205, 240, 225";

        // Meniscus
        ctx!.save();
        ctx!.translate(cx, cy + 2);
        ctx!.scale(1.4, 0.7);
        ctx!.beginPath();
        ctx!.arc(0, 0, baseR * 0.95, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${stroke}, 0.32)`;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();
        ctx!.restore();

        // 4 expanding wake rings
        for (let k = 0; k < 4; k++) {
          const phase = (t * 0.45 + i * 0.13 + k * 0.25) % 1;
          const r = baseR + phase * (38 + a.radius * minDim * 0.5);
          const fade = (1 - phase) * (1 - phase) * 0.48;
          ctx!.save();
          ctx!.translate(cx, cy + 3);
          ctx!.scale(1.45, 0.68);
          ctx!.beginPath();
          ctx!.arc(0, 0, r, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(${stroke}, ${fade})`;
          ctx!.lineWidth = 1.15;
          ctx!.stroke();
          ctx!.restore();
        }

        // Traveling outline arcs
        for (let s = 0; s < 8; s++) {
          const ang = t * 1.1 + i * 0.35 + s * ((Math.PI * 2) / 8);
          const wobble = Math.sin(t * 1.6 + s + i) * 4;
          ctx!.save();
          ctx!.translate(cx, cy + 2);
          ctx!.scale(1.4, 0.7);
          ctx!.beginPath();
          ctx!.arc(0, 0, baseR + 3 + wobble, ang, ang + 0.65);
          ctx!.strokeStyle = `rgba(${stroke}, 0.38)`;
          ctx!.lineWidth = 1.35;
          ctx!.stroke();
          ctx!.restore();
        }
      }

      for (let i = free.length - 1; i >= 0; i--) {
        const r = free[i];
        const age = (now - r.born) / 1000;
        const u = Math.min(1, Math.max(0, age / r.life));
        if (u >= 1) {
          free.splice(i, 1);
          continue;
        }
        const eased = 1 - Math.pow(1 - u, 2.1);
        const radius = Math.max(0.5, eased * r.maxRadius);
        const fade = (1 - u) * (1 - u) * 0.42 * r.strength;
        ctx!.save();
        ctx!.translate(r.x, r.y);
        ctx!.scale(r.aspect, 1);
        ctx!.beginPath();
        ctx!.arc(0, 0, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(215, 240, 230, ${fade})`;
        ctx!.lineWidth = 1.05;
        ctx!.stroke();
        if (radius > 8) {
          ctx!.beginPath();
          ctx!.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(200, 230, 220, ${fade * 0.45})`;
          ctx!.lineWidth = 0.7;
          ctx!.stroke();
        }
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
  }, [reducedMotion, anchors, flowTimeRef]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      aria-hidden
    />
  );
}
