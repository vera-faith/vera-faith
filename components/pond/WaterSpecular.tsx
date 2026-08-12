"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

type WaterSpecularProps = {
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
};

/** Stronger glassy wave-crest highlights — visible liquid motion on deep emerald. */
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
        width * 0.14 + Math.sin(t * 0.16) * 20,
        height * 0.1,
        0,
        width * 0.18,
        height * 0.16,
        Math.max(width, height) * 0.55,
      );
      g.addColorStop(0, "rgba(200, 235, 215, 0.14)");
      g.addColorStop(0.4, "rgba(90, 170, 145, 0.06)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);

      // Undulating wave ridges drifting down-right
      for (let i = 0; i < 20; i++) {
        const phase = t * 0.34 + i * 0.39;
        const yBase = ((i / 20 + t * 0.045) % 1.25) - 0.08;
        const y = yBase * height;
        const amp = 12 + (i % 4) * 4.5;
        const lit = 1 - Math.min(1, (y / height) * 0.7);
        const alpha = (0.055 + (Math.sin(phase * 1.4) * 0.5 + 0.5) * 0.1) * lit;

        ctx!.beginPath();
        for (let x = -50; x <= width + 50; x += 12) {
          const yy =
            y +
            Math.sin(x * 0.0075 + phase * 2.2) * amp +
            Math.sin(x * 0.017 + phase * 1.1) * (amp * 0.38) +
            Math.sin(t * 0.18) * 5;
          if (x === -50) ctx!.moveTo(x, yy);
          else ctx!.lineTo(x, yy);
        }
        ctx!.strokeStyle = `rgba(220, 245, 235, ${alpha})`;
        ctx!.lineWidth = 1.2 + lit * 0.8;
        ctx!.stroke();
      }

      // Crystal sparkles on crests — advect with current
      for (let i = 0; i < 55; i++) {
        const px = ((i * 89.7 + t * 36) % (width + 100)) - 50;
        const py =
          ((i * 47.3 + t * 22) % height) +
          Math.sin(t * 0.35 + i) * 14;
        const pulse = Math.pow(Math.max(0, Math.sin(t * 1.5 + i * 0.85)), 9);
        if (pulse < 0.14) continue;
        const a = pulse * 0.65 * (1 - Math.min(0.88, py / height));
        ctx!.fillStyle = `rgba(255, 250, 230, ${a})`;
        ctx!.beginPath();
        ctx!.arc(px, py, 1.45, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillRect(px - 0.35, py - 2.2, 0.7, 4.4);
        ctx!.fillRect(px - 2.2, py - 0.35, 4.4, 0.7);
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
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      aria-hidden
    />
  );
}
