"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

type WaterSpecularProps = {
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
};

/**
 * Procedural glassy specular sheet — flowing highlight ridges + clear luminous
 * bands that read as liquid glass, not a scanning light bar.
 */
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

    let raf = 0;
    function tick() {
      const t = flowTime.get();
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      // Soft luminous glass body — clearer midtones drifting with current
      const g = ctx!.createRadialGradient(
        width * 0.18 + Math.sin(t * 0.15) * 20,
        height * 0.14,
        0,
        width * 0.22,
        height * 0.2,
        Math.max(width, height) * 0.55,
      );
      g.addColorStop(0, "rgba(200, 235, 220, 0.14)");
      g.addColorStop(0.35, "rgba(120, 190, 170, 0.06)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);

      // Flowing specular ridges (wave crests) — horizontal-ish, liquid glass
      for (let i = 0; i < 14; i++) {
        const phase = t * 0.22 + i * 0.47;
        const yBase = ((i / 14) * 1.2 + Math.sin(phase) * 0.04) % 1.15;
        const y = yBase * height;
        const amp = 10 + (i % 3) * 4;
        const alpha = 0.04 + (Math.sin(phase * 1.3) * 0.5 + 0.5) * 0.07;
        // Brighter toward upper-left lit water
        const lit = 1 - Math.min(1, (y / height) * 0.7 + (i / 14) * 0.2);

        ctx!.beginPath();
        for (let x = -40; x <= width + 40; x += 18) {
          const yy =
            y +
            Math.sin(x * 0.008 + phase * 2.2) * amp +
            Math.sin(x * 0.021 + phase) * (amp * 0.35);
          if (x === -40) ctx!.moveTo(x, yy);
          else ctx!.lineTo(x, yy);
        }
        ctx!.strokeStyle = `rgba(230, 250, 240, ${alpha * lit})`;
        ctx!.lineWidth = 1.2 + lit * 0.8;
        ctx!.stroke();
      }

      // Tiny crystal glints riding the ridges
      for (let i = 0; i < 36; i++) {
        const px = ((i * 97.3 + t * 18) % (width + 80)) - 40;
        const py =
          ((i * 53.1) % height) +
          Math.sin(t * 0.35 + i) * 12 +
          Math.sin(t * 0.2) * 6;
        const pulse = Math.pow(Math.max(0, Math.sin(t * 1.4 + i * 0.9)), 10);
        if (pulse < 0.15) continue;
        const a = pulse * 0.55 * (1 - Math.min(1, py / height));
        ctx!.fillStyle = `rgba(255, 250, 230, ${a})`;
        ctx!.fillRect(px, py, 1.4, 1.4);
        ctx!.fillStyle = `rgba(220, 245, 235, ${a * 0.5})`;
        ctx!.beginPath();
        ctx!.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx!.fill();
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
