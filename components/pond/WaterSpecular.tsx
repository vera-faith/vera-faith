"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

type WaterSpecularProps = {
  reducedMotion: boolean;
  flowTime: MotionValue<number>;
};

/**
 * Natural water highlights only — soft crest glints + sparkles.
 * No long stroked white lines.
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

      // Soft sun pool — upper left
      const g = ctx!.createRadialGradient(
        width * 0.14 + Math.sin(t * 0.12) * 14,
        height * 0.1,
        0,
        width * 0.24,
        height * 0.22,
        Math.max(width, height) * 0.58,
      );
      g.addColorStop(0, "rgba(230, 245, 220, 0.18)");
      g.addColorStop(0.4, "rgba(110, 180, 150, 0.07)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);

      // Soft elongated crest glints (blobs, not strokes) drifting down-right
      for (let i = 0; i < 48; i++) {
        const phase = t * 0.28 + i * 1.17;
        const px =
          ((i * 137.3 + t * 28) % (width + 160)) - 80 + Math.sin(phase) * 18;
        const py =
          ((i * 89.1 + t * 17) % (height + 80)) - 40 + Math.cos(phase * 0.7) * 10;
        const sun = 0.5 + 0.5 * Math.max(0, 1 - (px / width) * 0.7 - (py / height) * 0.55);
        const pulse = 0.55 + 0.45 * (Math.sin(phase * 1.6) * 0.5 + 0.5);
        const a = 0.045 * sun * pulse;
        if (a < 0.012) continue;

        const rw = 28 + (i % 5) * 10;
        const rh = 4 + (i % 3) * 2.2;
        ctx!.save();
        ctx!.translate(px, py);
        ctx!.rotate(-0.35 + Math.sin(phase) * 0.08);
        const eg = ctx!.createRadialGradient(0, 0, 0, 0, 0, rw);
        eg.addColorStop(0, `rgba(245, 252, 240, ${a * 1.4})`);
        eg.addColorStop(0.45, `rgba(200, 235, 215, ${a * 0.55})`);
        eg.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = eg;
        ctx!.scale(1, rh / rw);
        ctx!.beginPath();
        ctx!.arc(0, 0, rw, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      // Broader soft caustic patches
      for (let i = 0; i < 16; i++) {
        const px = ((i * 211 + t * 16) % (width + 200)) - 100;
        const py = ((i * 157 + t * 11) % (height + 100)) - 50;
        const a = 0.035 * (0.55 + 0.45 * (1 - py / height));
        const eg = ctx!.createRadialGradient(px, py, 0, px, py, 70 + (i % 4) * 18);
        eg.addColorStop(0, `rgba(210, 240, 220, ${a})`);
        eg.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = eg;
        ctx!.beginPath();
        ctx!.ellipse(px, py, 90 + (i % 3) * 20, 22 + (i % 2) * 8, -0.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Diamond sparkles on wave peaks
      for (let i = 0; i < 70; i++) {
        const px = ((i * 97.3 + t * 34) % (width + 100)) - 50;
        const py =
          ((i * 53.1 + t * 20) % height) + Math.sin(t * 0.35 + i) * 10;
        const inSun = px / width < 0.55 && py / height < 0.5;
        const pulse = Math.pow(Math.max(0, Math.sin(t * 1.55 + i * 0.91)), inSun ? 8 : 11);
        if (pulse < 0.15) continue;
        const a = pulse * (inSun ? 0.75 : 0.38);
        const s = inSun ? 1.55 : 1.1;
        ctx!.fillStyle = `rgba(255, 252, 235, ${a})`;
        ctx!.beginPath();
        ctx!.arc(px, py, s * 0.75, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillRect(px - 0.3, py - s * 1.35, 0.6, s * 2.7);
        ctx!.fillRect(px - s * 1.35, py - 0.3, s * 2.7, 0.6);
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
