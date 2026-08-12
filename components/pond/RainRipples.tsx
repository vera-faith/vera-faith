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

/**
 * Soft object-driven water contact — filled glows & wake patches only.
 * No stroked arcs / long white lines.
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

    function plantCenter(a: PlantAnchor, t: number) {
      const drift = Math.sin(t * 0.16) * 12;
      return {
        cx: a.nx * width + drift,
        cy: a.ny * height + drift * 0.82,
        r: Math.max(22, a.radius * Math.min(width, height)),
      };
    }

    let raf = 0;
    function tick() {
      const t = flowTimeRef?.current ?? performance.now() / 1000;
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const { cx, cy, r } = plantCenter(a, t);
        const isPink = a.tint === "pink";
        const rgb = isPink ? "220, 175, 195" : "190, 225, 210";
        const sx = 1.5;
        const sy = 0.58;

        // Soft contact ring as filled elliptical band (not a stroked outline)
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.9 + i);
        ctx!.save();
        ctx!.translate(cx, cy + 3);
        ctx!.scale(sx, sy);
        const contact = ctx!.createRadialGradient(0, 0, r * 0.72, 0, 0, r * 1.12);
        contact.addColorStop(0, "rgba(0,0,0,0)");
        contact.addColorStop(0.72, "rgba(0,0,0,0)");
        contact.addColorStop(0.88, `rgba(${rgb}, ${0.16 + pulse * 0.1})`);
        contact.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = contact;
        ctx!.beginPath();
        ctx!.arc(0, 0, r * 1.14, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();

        // Expanding soft wakes — filled annuli fading as they advect down-right
        for (let k = 0; k < 3; k++) {
          const phase = (t * 0.28 + i * 0.15 + k * 0.33) % 1;
          const expand = phase * r * 0.7;
          const fade = (1 - phase) * (1 - phase) * 0.14;
          if (fade < 0.02) continue;
          const ax = cx + phase * 16;
          const ay = cy + phase * 12 + 3;
          ctx!.save();
          ctx!.translate(ax, ay);
          ctx!.scale(sx, sy);
          const wake = ctx!.createRadialGradient(0, 0, r + expand * 0.55, 0, 0, r + expand);
          wake.addColorStop(0, "rgba(0,0,0,0)");
          wake.addColorStop(0.65, "rgba(0,0,0,0)");
          wake.addColorStop(0.85, `rgba(${rgb}, ${fade})`);
          wake.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.fillStyle = wake;
          ctx!.beginPath();
          ctx!.arc(0, 0, r + expand, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }

        // Downstream highlight patches — current wrapping past the body
        for (let s = 0; s < 4; s++) {
          const ang = -0.35 + s * 0.55 + Math.sin(t * 0.7 + i) * 0.08;
          const dist = r * (1.05 + 0.12 * Math.sin(t * 1.1 + s + i));
          const hx = cx + Math.cos(ang) * dist * sx + 8;
          const hy = cy + Math.sin(ang) * dist * sy + 6;
          const ha = 0.08 + 0.05 * Math.sin(t * 1.3 + s);
          const hg = ctx!.createRadialGradient(hx, hy, 0, hx, hy, 18);
          hg.addColorStop(0, `rgba(235, 248, 240, ${ha})`);
          hg.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.fillStyle = hg;
          ctx!.beginPath();
          ctx!.ellipse(hx, hy, 16 + s * 2, 5, ang + 0.4, 0, Math.PI * 2);
          ctx!.fill();
        }

        // Tiny edge sparkles at contact — especially for small buds
        const sparkN = isPink ? 5 : 3;
        for (let s = 0; s < sparkN; s++) {
          const ang = t * 0.4 + i + s * ((Math.PI * 2) / sparkN);
          const rr = r * (0.95 + 0.08 * Math.sin(t * 1.5 + s));
          const sx2 = cx + Math.cos(ang) * rr * sx;
          const sy2 = cy + Math.sin(ang) * rr * sy + 2;
          const sp = Math.pow(Math.max(0, Math.sin(t * 1.8 + s * 2 + i)), 6);
          if (sp < 0.2) continue;
          ctx!.fillStyle = `rgba(255, 250, 235, ${sp * 0.45})`;
          ctx!.beginPath();
          ctx!.arc(sx2, sy2, 1.1, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, anchors, flowTimeRef]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-85"
      aria-hidden
    />
  );
}
