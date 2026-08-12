"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

type WaterSpecularProps = {
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
};

/** Stronger glassy wave-crest highlights — visible liquid motion. */
export function WaterSpecular({ reducedMotion, flowTime }: WaterSpecularProps) {
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

    let raf = 0;
    function tick() {
      const t = flowTime.get();
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      const g = ctx!.createRadialGradient(
        width * 0.16 + Math.sin(t * 0.18) * 24,
        height * 0.12,
        0,
        width * 0.2,
        height * 0.18,
        Math.max(width, height) * 0.58,
      );
      g.addColorStop(0, "rgba(210, 240, 225, 0.18)");
      g.addColorStop(0.4, "rgba(130, 200, 175, 0.07)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);

      // Visible undulating wave ridges
      for (let i = 0; i < 18; i++) {
        const phase = t * 0.32 + i * 0.41;
        const yBase = ((i / 18 + t * 0.04) % 1.2) - 0.05;
        const y = yBase * height;
        const amp = 14 + (i % 4) * 5;
        const lit = 1 - Math.min(1, y / height * 0.65);
        const alpha = (0.07 + (Math.sin(phase * 1.4) * 0.5 + 0.5) * 0.12) * lit;

        ctx!.beginPath();
        for (let x = -50; x <= width + 50; x += 14) {
          const yy =
            y +
            Math.sin(x * 0.007 + phase * 2.4) * amp +
            Math.sin(x * 0.018 + phase * 1.2) * (amp * 0.4) +
            Math.sin(t * 0.2) * 6;
          if (x === -50) ctx!.moveTo(x, yy);
          else ctx!.lineTo(x, yy);
        }
        ctx!.strokeStyle = `rgba(235, 250, 240, ${alpha})`;
        ctx!.lineWidth = 1.4 + lit;
        ctx!.stroke();
      }

      // Crystal sparkles on crests
      for (let i = 0; i < 50; i++) {
        const px = ((i * 89.7 + t * 28) % (width + 100)) - 50;
        const py =
          ((i * 47.3 + t * 8) % height) +
          Math.sin(t * 0.4 + i) * 16;
        const pulse = Math.pow(Math.max(0, Math.sin(t * 1.6 + i * 0.85)), 9);
        if (pulse < 0.12) continue;
        const a = pulse * 0.7 * (1 - Math.min(0.85, py / height));
        ctx!.fillStyle = `rgba(255, 252, 235, ${a})`;
        ctx!.beginPath();
        ctx!.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillRect(px - 0.4, py - 2.4, 0.8, 4.8);
        ctx!.fillRect(px - 2.4, py - 0.4, 4.8, 0.8);
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
      className="pointer-events-none absolute inset-0 h-full w-full opacity-95"
      aria-hidden
    />
  );
}
