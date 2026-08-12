"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

export type PlantAnchor = {
  nx: number;
  ny: number;
  radius: number;
  /** Optional tint for flower-colored edge ripples */
  tint?: "pink" | "green";
};

type RainRipplesProps = {
  reducedMotion: boolean;
  anchors?: readonly PlantAnchor[];
  /** Shared pond time in seconds for synced wakes */
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

/**
 * Water that wraps plant silhouettes: continuous expanding wakes from each
 * floater edge + tiny traveling arcs + sparse open-water sparkles.
 */
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

    const free: FreeRipple[] = [];
    let nextFree = performance.now() + 500;

    function spawnFree(x: number, y: number, strength: number, life: number, maxRadius: number) {
      if (free.length > 22) free.shift();
      free.push({
        x,
        y,
        born: performance.now(),
        life,
        maxRadius,
        strength,
        aspect: 1.4,
      });
    }

    function onPointerDown(event: PointerEvent) {
      spawnFree(event.clientX, event.clientY, 0.35, 1.8, 14);
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    let raf = 0;
    function tick() {
      const now = performance.now();
      const t = flowTimeRef?.current ?? now / 1000;
      const minDim = Math.min(width, height);

      if (now >= nextFree) {
        spawnFree(
          Math.random() * width,
          Math.random() * height,
          0.1 + Math.random() * 0.08,
          1.2 + Math.random() * 0.5,
          3 + Math.random() * 5,
        );
        nextFree = now + 420 + Math.random() * 520;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      // Silhouette-tracing wakes — rings expand FROM each plant edge outward
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const cx = a.nx * width;
        const cy = a.ny * height;
        const baseR = Math.max(18, a.radius * minDim * 1.05);
        const isPink = a.tint === "pink";
        const stroke = isPink ? "220, 170, 190" : "190, 225, 210";

        // Contact meniscus — tight ellipse hugging the silhouette
        ctx!.save();
        ctx!.translate(cx, cy + 2);
        ctx!.scale(1.35, 0.72);
        ctx!.beginPath();
        ctx!.arc(0, 0, baseR * 0.92, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${stroke}, 0.16)`;
        ctx!.lineWidth = 1.1;
        ctx!.stroke();
        ctx!.restore();

        // Expanding wake rings (3 phases per plant)
        for (let k = 0; k < 3; k++) {
          const phase = (t * 0.35 + i * 0.17 + k * 0.33) % 1;
          const r = baseR + phase * (26 + a.radius * minDim * 0.35);
          const fade = (1 - phase) * (1 - phase) * 0.28;
          ctx!.save();
          ctx!.translate(cx, cy + 3);
          ctx!.scale(1.4, 0.7);
          ctx!.beginPath();
          ctx!.arc(0, 0, r, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(${stroke}, ${fade})`;
          ctx!.lineWidth = 0.85;
          ctx!.stroke();
          ctx!.restore();
        }

        // Traveling micro-arcs that trace the outline (nature wrapping water)
        for (let s = 0; s < 6; s++) {
          const ang = t * 0.9 + i * 0.4 + s * ((Math.PI * 2) / 6);
          const wobble = Math.sin(t * 1.4 + s + i) * 3;
          const rr = baseR + 2 + wobble;
          ctx!.save();
          ctx!.translate(cx, cy + 2);
          ctx!.scale(1.35, 0.72);
          ctx!.beginPath();
          ctx!.arc(0, 0, rr, ang, ang + 0.55);
          ctx!.strokeStyle = `rgba(${stroke}, 0.22)`;
          ctx!.lineWidth = 1.15;
          ctx!.stroke();
          ctx!.restore();
        }
      }

      // Sparse free ripples in open water
      for (let i = free.length - 1; i >= 0; i--) {
        const r = free[i];
        const age = (now - r.born) / 1000;
        const u = Math.min(1, Math.max(0, age / r.life));
        if (u >= 1) {
          free.splice(i, 1);
          continue;
        }
        const eased = 1 - Math.pow(1 - u, 2.2);
        const radius = eased * r.maxRadius;
        const fade = (1 - u) * (1 - u) * 0.2 * r.strength;
        ctx!.save();
        ctx!.translate(r.x, r.y);
        ctx!.scale(r.aspect, 1);
        ctx!.beginPath();
        ctx!.arc(0, 0, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(200, 230, 215, ${fade})`;
        ctx!.lineWidth = 0.65;
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
  }, [reducedMotion, anchors, flowTimeRef]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden
    />
  );
}
