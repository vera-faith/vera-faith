"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

type SparkleAuraProps = {
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
};

type Spark = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  warm: boolean;
};

/** Glassy neo sparkles — diamond glints on wave peaks, denser near upper-left sun. */
export function SparkleAura({ reducedMotion, flowTime }: SparkleAuraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let sparks: Spark[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      sparks = [];
      const count = Math.min(56, Math.floor((width * height) / 32000));
      for (let i = 0; i < count; i++) {
        // Bias toward upper-left lit water
        const bias = Math.random();
        const x = bias < 0.55 ? Math.random() * width * 0.55 : Math.random() * width;
        const y = bias < 0.55 ? Math.random() * height * 0.5 : Math.random() * height;
        sparks.push({
          x,
          y,
          size: 0.6 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 1.6,
          warm: Math.random() > 0.35,
        });
      }
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;

    function tick() {
      const t = flowTime.get();
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (const s of sparks) {
        const pulse = Math.pow(Math.max(0, Math.sin(t * s.speed + s.phase)), 8);
        if (pulse < 0.08) continue;
        const driftX = Math.sin(t * 0.2 + s.phase) * 6 + t * 4;
        const driftY = Math.sin(t * 0.2) * 2.5 + Math.cos(t * 0.45 + s.phase) * 2 + t * 2.5;
        const x = ((s.x + driftX) % width + width) % width;
        const y = ((s.y + driftY) % height + height) % height;
        const a = pulse * 0.85;
        const color = s.warm
          ? `rgba(255, 245, 210, ${a})`
          : `rgba(220, 245, 235, ${a * 0.85})`;

        ctx!.beginPath();
        ctx!.arc(x, y, s.size * 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = s.warm
          ? `rgba(255, 235, 180, ${a * 0.25})`
          : `rgba(200, 235, 220, ${a * 0.2})`;
        ctx!.fill();

        ctx!.fillStyle = color;
        ctx!.fillRect(x - s.size * 0.35, y - s.size * 1.4, s.size * 0.7, s.size * 2.8);
        ctx!.fillRect(x - s.size * 1.4, y - s.size * 0.35, s.size * 2.8, s.size * 0.7);
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, flowTime]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      aria-hidden
    />
  );
}
