import * as THREE from "three";
import type { CoverTheme, Project } from "@/data/projects";
import { getProjectIndex, projects } from "@/data/projects";

const DISPLAY_FONT = "'Instrument Serif', Georgia, serif";
const SANS_FONT = "'Manrope', Helvetica, Arial, sans-serif";

const themePalettes: Record<
  CoverTheme,
  { base: string; mid: string; accent: string; ink: string; glow: string }
> = {
  "pearlescent-pink": {
    base: "#f4cdda",
    mid: "#e6a3bc",
    accent: "#fdeaf0",
    ink: "#6a3f54",
    glow: "#fff2f6",
  },
  "icy-blue": {
    base: "#cfe4f3",
    mid: "#8db6da",
    accent: "#eaf5fc",
    ink: "#31506e",
    glow: "#ffffff",
  },
  chrome: {
    base: "#d3d8e0",
    mid: "#9aa1b0",
    accent: "#f1f3f6",
    ink: "#333944",
    glow: "#ffffff",
  },
  "warm-orange": {
    base: "#f3bd8a",
    mid: "#df8944",
    accent: "#fbe3c4",
    ink: "#6a3b1a",
    glow: "#fff2d8",
  },
  floral: {
    base: "#ecc7d3",
    mid: "#cf93a7",
    accent: "#f8e2ea",
    ink: "#5a3546",
    glow: "#fff0f5",
  },
  "dark-purple": {
    base: "#a687c9",
    mid: "#5f4485",
    accent: "#d3bceb",
    ink: "#241a35",
    glow: "#e9d9ff",
  },
  glass: {
    base: "#e6dcea",
    mid: "#c3b3cd",
    accent: "#f4edf6",
    ink: "#463a4f",
    glow: "#ffffff",
  },
};

const textureCache = new Map<string, THREE.CanvasTexture>();

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashSeed(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) || 1;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, size * 0.3, size);
  gradient.addColorStop(0, palette.accent);
  gradient.addColorStop(0.5, palette.base);
  gradient.addColorStop(1, palette.mid);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawPearlescent(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
  rng: () => number,
) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const cx = size * (0.2 + rng() * 0.6);
    const cy = size * (0.15 + rng() * 0.5);
    const r = size * (0.26 + rng() * 0.2);
    const sheen = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sheen.addColorStop(0, `${palette.glow}33`);
    sheen.addColorStop(0.5, `${palette.accent}22`);
    sheen.addColorStop(1, `${palette.accent}00`);
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Faint diagonal iridescent sweep
  const sweep = ctx.createLinearGradient(0, size, size, 0);
  sweep.addColorStop(0, "#ffd9ec00");
  sweep.addColorStop(0.45, "#ffe9f522");
  sweep.addColorStop(0.55, "#e6f6ff1f");
  sweep.addColorStop(1, "#ffe9d900");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

function drawIcyFacets(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
  rng: () => number,
) {
  ctx.save();
  const facetCount = 5;
  for (let i = 0; i < facetCount; i++) {
    const cx = size * (0.15 + rng() * 0.7);
    const cy = size * (0.15 + rng() * 0.65);
    const spread = size * (0.14 + rng() * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx, cy - spread);
    ctx.lineTo(cx + spread * 0.85, cy - spread * 0.15);
    ctx.lineTo(cx + spread * 0.4, cy + spread * 0.9);
    ctx.lineTo(cx - spread * 0.6, cy + spread * 0.5);
    ctx.closePath();
    const facetGrad = ctx.createLinearGradient(cx - spread, cy - spread, cx + spread, cy + spread);
    facetGrad.addColorStop(0, `${palette.glow}2e`);
    facetGrad.addColorStop(1, `${palette.glow}00`);
    ctx.fillStyle = facetGrad;
    ctx.fill();
    ctx.strokeStyle = `${palette.glow}40`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();

  // Sparkle glints
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 1 + rng() * 1.6;
    ctx.globalAlpha = 0.3 + rng() * 0.3;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawChromeStreaks(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
) {
  ctx.save();
  const streaks: Array<[number, number]> = [
    [-0.15, 0.55],
    [0.05, 0.85],
    [0.42, 1.25],
  ];
  for (const [start, width] of streaks) {
    const x0 = size * start;
    const streak = ctx.createLinearGradient(x0, 0, x0 + size * width, size);
    streak.addColorStop(0, `${palette.glow}00`);
    streak.addColorStop(0.46, `${palette.glow}00`);
    streak.addColorStop(0.5, `${palette.glow}88`);
    streak.addColorStop(0.54, `${palette.glow}00`);
    streak.addColorStop(1, `${palette.glow}00`);
    ctx.fillStyle = streak;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.restore();
}

function drawSunburst(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
) {
  const cx = size * 0.5;
  const cy = size * 0.72;
  ctx.save();
  const rays = 16;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const len = size * 0.6;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const ray = ctx.createLinearGradient(0, 0, 0, -len);
    ray.addColorStop(0, `${palette.glow}2e`);
    ray.addColorStop(1, `${palette.glow}00`);
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, 0);
    ctx.lineTo(size * 0.02, 0);
    ctx.lineTo(0, -len);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.28);
  disc.addColorStop(0, `${palette.glow}66`);
  disc.addColorStop(1, `${palette.glow}00`);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBotanical(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
  rng: () => number,
) {
  function bloom(cx: number, cy: number, scale: number, alpha: number) {
    const petals = 7;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const len = size * 0.16 * scale;
      const width = size * 0.09 * scale;
      const grad = ctx.createRadialGradient(0, -len * 0.5, 0, 0, -len * 0.5, len * 0.7);
      grad.addColorStop(0, `${palette.glow}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
      grad.addColorStop(1, `${palette.glow}00`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, -len * 0.5, width * 0.5, len * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `${palette.ink}22`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    const budGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.045 * scale);
    budGrad.addColorStop(0, `${palette.ink}44`);
    budGrad.addColorStop(1, `${palette.ink}00`);
    ctx.fillStyle = budGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.045 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  bloom(size * 0.28, size * 0.28, 1.15, 0.85);
  bloom(size * 0.76, size * 0.2, 0.65, 0.55);
  bloom(size * 0.8, size * 0.62, 0.8, 0.6);
  bloom(size * 0.18, size * 0.78, 0.55, 0.45);

  // Fine stem lines
  ctx.save();
  ctx.strokeStyle = `${palette.ink}22`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const sx = size * (0.2 + rng() * 0.6);
    ctx.moveTo(sx, size * 0.95);
    ctx.quadraticCurveTo(sx + (rng() - 0.5) * 60, size * 0.6, sx + (rng() - 0.5) * 40, size * 0.35);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStarfield(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
  rng: () => number,
) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const cx = size * (0.2 + rng() * 0.6);
    const cy = size * (0.15 + rng() * 0.5);
    const r = size * (0.22 + rng() * 0.2);
    const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    nebula.addColorStop(0, `${palette.glow}30`);
    nebula.addColorStop(1, `${palette.glow}00`);
    ctx.fillStyle = nebula;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 40; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 0.6 + rng() * 1.4;
    ctx.globalAlpha = 0.25 + rng() * 0.4;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGlassPanes(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
) {
  ctx.save();
  const margin = size * 0.14;
  const panelSize = size - margin * 2;
  ctx.fillStyle = `${palette.glow}22`;
  ctx.fillRect(margin, margin, panelSize, panelSize);
  ctx.strokeStyle = `${palette.glow}88`;
  ctx.lineWidth = 3;
  ctx.strokeRect(margin, margin, panelSize, panelSize);

  ctx.beginPath();
  ctx.moveTo(margin, margin + panelSize * 0.32);
  ctx.lineTo(margin + panelSize, margin + panelSize * 0.12);
  ctx.lineWidth = 26;
  ctx.strokeStyle = `${palette.glow}33`;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin + panelSize * 0.15, margin + panelSize);
  ctx.lineTo(margin + panelSize * 0.4, margin);
  ctx.lineWidth = 14;
  ctx.strokeStyle = `${palette.glow}22`;
  ctx.stroke();
  ctx.restore();
}

function drawThemeArt(
  ctx: CanvasRenderingContext2D,
  theme: CoverTheme,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
  rng: () => number,
) {
  switch (theme) {
    case "pearlescent-pink":
      drawPearlescent(ctx, palette, size, rng);
      break;
    case "icy-blue":
      drawIcyFacets(ctx, palette, size, rng);
      break;
    case "chrome":
      drawChromeStreaks(ctx, palette, size);
      break;
    case "warm-orange":
      drawSunburst(ctx, palette, size);
      break;
    case "floral":
      drawBotanical(ctx, palette, size, rng);
      break;
    case "dark-purple":
      drawStarfield(ctx, palette, size, rng);
      break;
    case "glass":
      drawGlassPanes(ctx, palette, size);
      break;
  }
}

function drawGrain(ctx: CanvasRenderingContext2D, size: number, rng: () => number) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 700; i++) {
    const gx = rng() * size;
    const gy = rng() * size;
    ctx.fillStyle = rng() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(gx, gy, 1.4, 1.4);
  }
  ctx.restore();
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
) {
  const inset = size * 0.045;
  ctx.save();
  ctx.strokeStyle = `${palette.ink}2a`;
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);
  ctx.restore();

  // Seam near the right edge, hinting the vinyl lives inside.
  const seamGradient = ctx.createLinearGradient(size * 0.9, 0, size, 0);
  seamGradient.addColorStop(0, `${palette.ink}00`);
  seamGradient.addColorStop(1, `${palette.ink}26`);
  ctx.fillStyle = seamGradient;
  ctx.fillRect(size * 0.88, size * 0.04, size * 0.12, size * 0.92);
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  project: Project,
  palette: (typeof themePalettes)[CoverTheme],
  size: number,
) {
  const cx = size * 0.5;
  const plateY = size * 0.42;
  const plateW = size * 0.78;
  const plateH = size * 0.22;

  ctx.save();
  const plateGrad = ctx.createLinearGradient(cx - plateW / 2, plateY, cx + plateW / 2, plateY + plateH);
  plateGrad.addColorStop(0, `${palette.glow}00`);
  plateGrad.addColorStop(0.5, `${palette.glow}59`);
  plateGrad.addColorStop(1, `${palette.glow}00`);
  ctx.fillStyle = plateGrad;
  ctx.fillRect(cx - plateW / 2, plateY, plateW, plateH);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = palette.ink;
  ctx.font = `400 66px ${DISPLAY_FONT}`;
  ctx.fillText(project.title.toUpperCase(), cx, size * 0.485);

  ctx.font = `500 24px ${SANS_FONT}`;
  ctx.globalAlpha = 0.78;
  ctx.fillText(project.subtitle, cx, size * 0.535);
  ctx.globalAlpha = 1;

  // Thin rule under the title block
  ctx.strokeStyle = `${palette.ink}40`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, size * 0.565);
  ctx.lineTo(cx + size * 0.14, size * 0.565);
  ctx.stroke();

  const index = getProjectIndex(project.id);
  const indexLabel = `${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;

  ctx.font = `600 20px ${SANS_FONT}`;
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.75;
  ctx.fillText(indexLabel, size * 0.09, size * 0.925);
  ctx.textAlign = "right";
  ctx.fillText(project.year, size * 0.91, size * 0.925);
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
}

function drawCover(canvas: HTMLCanvasElement, project: Project) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  const palette = themePalettes[project.coverTheme];
  const rng = seededRandom(hashSeed(project.id));

  drawBackground(ctx, palette, size);
  drawThemeArt(ctx, project.coverTheme, palette, size, rng);
  drawGrain(ctx, size, rng);
  drawLabel(ctx, project, palette, size);
  drawFrame(ctx, palette, size);
}

function buildTexture(project: Project, anisotropy: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  drawCover(canvas, project);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Returns a cached cover texture for a project, building it once. If the
 * display font hasn't loaded yet, an immediate fallback-font texture is
 * returned and swapped in-place once the real font is ready.
 */
export function createCoverTexture(project: Project, anisotropy = 8) {
  const cached = textureCache.get(project.id);
  if (cached) return cached;

  const texture = buildTexture(project, anisotropy);
  textureCache.set(project.id, texture);

  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready
      .then(() => {
        const canvas = texture.image as HTMLCanvasElement;
        drawCover(canvas, project);
        texture.needsUpdate = true;
      })
      .catch(() => undefined);
  }

  return texture;
}

export function getCoverMaterialProps(theme: CoverTheme) {
  switch (theme) {
    case "chrome":
      return { metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 };
    case "glass":
      return {
        metalness: 0.05,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.88,
      };
    case "pearlescent-pink":
    case "icy-blue":
      return { metalness: 0.25, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.35 };
    default:
      return { metalness: 0.15, roughness: 0.48, clearcoat: 0.4, clearcoatRoughness: 0.4 };
  }
}
