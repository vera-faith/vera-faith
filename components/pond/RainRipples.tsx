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

/** Flow lines + edge wakes that bend around plant disks (drawn under flora). */
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
    let nextFree = performance.now() + 160;

    function spawnFree(x: number, y: number, strength: number, life: number, maxRadius: number) {
      if (free.length > 48) free.shift();
      free.push({
        x,
        y,
        born: performance.now(),
        life,
        maxRadius,
        strength,
        aspect: 1.55,
      });
    }

    for (let i = 0; i < 12; i++) {
      spawnFree(Math.random() * 800, Math.random() * 600, 0.28, 2.1, 14 + Math.random() * 22);
    }

    function onPointerDown(e: PointerEvent) {
      spawnFree(e.clientX, e.clientY, 0.55, 2.4, 28);
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    function nearestPlant(x: number, y: number) {
      let best = Infinity;
      let hit: PlantAnchor | null = null;
      for (const a of anchors) {
        const cx = a.nx * width;
        const cy = a.ny * height;
        const r = Math.max(28, a.radius * Math.min(width, height) * 1.35);
        const d = Math.hypot(x - cx, y - cy);
        const norm = d / r;
        if (norm < best) {
          best = norm;
          hit = a;
        }
      }
      return { dist: best, anchor: hit };
    }

    /** Push a point away from plant disks so flow bends around them */
    function deflect(x: number, y: number) {
      let px = x;
      let py = y;
      for (const a of anchors) {
        const cx = a.nx * width + Math.sin((flowTimeRef?.current ?? 0) * 0.16) * 10;
        const cy = a.ny * height + Math.sin((flowTimeRef?.current ?? 0) * 0.16) * 8;
        const r = Math.max(28, a.radius * Math.min(width, height) * 1.35);
        const dx = px - cx;
        const dy = py - cy;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (d < r * 1.55) {
          const push = (r * 1.55 - d) / (r * 1.55);
          const nx = dx / d;
          const ny = dy / d;
          // Lateral bias keeps streamlines wrapping past the silhouette
          px += nx * push * r * 0.72;
          py += ny * push * r * 0.38;
        }
      }
      return { x: px, y: py };
    }

    let raf = 0;
    function tick() {
      const now = performance.now();
      const t = flowTimeRef?.current ?? now / 1000;
      const minDim = Math.min(width, height) || 1;

      if (now >= nextFree) {
        spawnFree(
          Math.random() * width,
          Math.random() * height,
          0.18 + Math.random() * 0.2,
          1.6 + Math.random(),
          10 + Math.random() * 18,
        );
        if (anchors.length) {
          const a = anchors[(Math.random() * anchors.length) | 0];
          const ang = Math.random() * Math.PI * 2;
          const edge = a.radius * minDim * (1.05 + Math.random() * 0.45);
          spawnFree(
            a.nx * width + Math.cos(ang) * edge + Math.sin(t * 0.16) * 10,
            a.ny * height + Math.sin(ang) * edge * 0.62 + Math.sin(t * 0.16) * 8,
            0.38,
            2,
            14 + Math.random() * 16,
          );
        }
        nextFree = now + 110 + Math.random() * 170;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      // Flow streamlines — travel down-right, bend hard around plants
      const laneCount = 20;
      for (let lane = 0; lane < laneCount; lane++) {
        const baseY = ((lane + 0.5) / laneCount) * height;
        const phase = t * 62 + lane * 41;
        ctx!.beginPath();
        let started = false;
        for (let s = -100; s < width + 140; s += 8) {
          const x0 = ((s + phase) % (width + 240)) - 120;
          const y0 = baseY + Math.sin(x0 * 0.011 + t * 0.85 + lane) * 12;
          const p = deflect(x0, y0);
          const { dist } = nearestPlant(p.x, p.y);
          // Fade streamlines that would cross plant centers
          if (dist < 0.72) {
            if (started) {
              ctx!.stroke();
              started = false;
              ctx!.beginPath();
            }
            continue;
          }
          if (!started) {
            ctx!.moveTo(p.x, p.y);
            started = true;
          } else ctx!.lineTo(p.x, p.y);
        }
        if (started) {
          const a = 0.055 + (lane % 3) * 0.012;
          ctx!.strokeStyle = `rgba(195, 225, 215, ${a})`;
          ctx!.lineWidth = 1.1;
          ctx!.stroke();
        }
      }

      // Plant-edge wakes — expand + advect down-right (never fill the silhouette)
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const cx = a.nx * width + Math.sin(t * 0.16) * 10;
        const cy = a.ny * height + Math.sin(t * 0.16) * 8;
        const baseR = Math.max(22, a.radius * minDim * 1.15);
        const stroke = a.tint === "pink" ? "210, 160, 180" : "175, 215, 200";

        // Contact ring hugging the object
        ctx!.save();
        ctx!.translate(cx, cy + 3);
        ctx!.scale(1.5, 0.58);
        ctx!.beginPath();
        ctx!.arc(0, 0, baseR * 0.98, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${stroke}, 0.32)`;
        ctx!.lineWidth = 1.35;
        ctx!.stroke();
        ctx!.restore();

        for (let k = 0; k < 4; k++) {
          const phase = (t * 0.38 + i * 0.13 + k * 0.24) % 1;
          const r = baseR + phase * (40 + a.radius * minDim * 0.45);
          const ax = cx + phase * 26;
          const ay = cy + phase * 20;
          const fade = (1 - phase) * (1 - phase) * 0.36;
          ctx!.save();
          ctx!.translate(ax, ay + 3);
          ctx!.scale(1.55, 0.56);
          ctx!.beginPath();
          ctx!.arc(0, 0, r, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(${stroke}, ${fade})`;
          ctx!.lineWidth = 1.05;
          ctx!.stroke();
          ctx!.restore();
        }

        // Downstream wrap crescents — current splitting past the body
        for (let s = 0; s < 6; s++) {
          const ang = 0.2 + s * 0.32 + Math.sin(t * 0.9 + i) * 0.1;
          ctx!.save();
          ctx!.translate(cx + 10, cy + 6);
          ctx!.scale(1.5, 0.58);
          ctx!.beginPath();
          ctx!.arc(0, 0, baseR + 6 + Math.sin(t * 1.15 + s) * 3.5, ang, ang + 0.85);
          ctx!.strokeStyle = `rgba(${stroke}, 0.3)`;
          ctx!.lineWidth = 1.25;
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
        const fade = (1 - u) * (1 - u) * 0.32 * r.strength;
        const dx = eased * 28;
        const dy = eased * 20;
        const px = r.x + dx;
        const py = r.y + dy;
        const { dist } = nearestPlant(px, py);
        if (dist < 0.55) continue;
        ctx!.save();
        ctx!.translate(px, py);
        ctx!.scale(r.aspect, 1);
        ctx!.beginPath();
        ctx!.arc(0, 0, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(200, 230, 220, ${fade})`;
        ctx!.lineWidth = 0.95;
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
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      aria-hidden
    />
  );
}
