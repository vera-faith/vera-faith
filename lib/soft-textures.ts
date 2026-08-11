import * as THREE from "three";

let cloudPuffTexture: THREE.Texture | null = null;
let moteDotTexture: THREE.Texture | null = null;
const petalBloomTextures = new Map<string, THREE.Texture>();
const haloRingTextures = new Map<string, THREE.Texture>();

/** Soft radial-gradient puff used for cloud sprites. Generated once and cached. */
export function getCloudPuffTexture() {
  if (cloudPuffTexture) return cloudPuffTexture;
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.7)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.22)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  // A few softer overlapping puffs so the silhouette isn't a perfect circle.
  const lobes = [
    { x: 90, y: 150, r: 78 },
    { x: 175, y: 140, r: 84 },
    { x: 130, y: 100, r: 70 },
  ];
  for (const lobe of lobes) {
    const g = ctx.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, lobe.r);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cloudPuffTexture = texture;
  return texture;
}

/**
 * A soft-focus, out-of-focus-photograph style flower bloom: translucent
 * glassy petals with heavily feathered edges so it reads as dreamy
 * atmosphere rather than a crisp illustrated sticker. Rendered as a
 * billboard so it always reads clearly, regardless of viewing angle.
 */
export function getPetalBloomTexture(petalColor: string, budColor: string) {
  const key = `${petalColor}|${budColor}`;
  const cached = petalBloomTextures.get(key);
  if (cached) return cached;
  if (typeof document === "undefined") return null;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cx = size / 2;
  const cy = size / 2;
  const petalCount = 6;
  const petalLength = size * 0.32;
  const petalWidth = size * 0.19;

  ctx.filter = "blur(14px)";

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(0, -petalLength * 0.42);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petalLength * 0.65);
    gradient.addColorStop(0, `${petalColor}99`);
    gradient.addColorStop(0.55, `${petalColor}55`);
    gradient.addColorStop(1, `${petalColor}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, petalWidth * 0.5, petalLength * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thin glassy rim highlight along one edge of the petal.
    const rim = ctx.createLinearGradient(-petalWidth * 0.25, 0, petalWidth * 0.25, 0);
    rim.addColorStop(0, "#ffffff00");
    rim.addColorStop(0.5, "#ffffff33");
    rim.addColorStop(1, "#ffffff00");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.ellipse(0, 0, petalWidth * 0.5, petalLength * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const budGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.09);
  budGradient.addColorStop(0, `${budColor}dd`);
  budGradient.addColorStop(1, `${budColor}00`);
  ctx.fillStyle = budGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = "none";

  // A final overall soft glow wash to fully dissolve any remaining hard
  // silhouette, so the bloom reads as diffuse light rather than a decal.
  ctx.filter = "blur(6px)";
  const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48);
  wash.addColorStop(0, `${petalColor}22`);
  wash.addColorStop(1, `${petalColor}00`);
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  petalBloomTextures.set(key, texture);
  return texture;
}

/** Soft ring / halo of light — a thin glowing torus-like ring drawn as a
 * billboard sprite. Reads as a dreamy halo rather than a hard-edged shape. */
export function getHaloRingTexture(color: string) {
  const cached = haloRingTextures.get(color);
  if (cached) return cached;
  if (typeof document === "undefined") return null;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.46;
  const inner = size * 0.3;

  ctx.filter = "blur(10px)";
  for (let r = inner; r < outer; r += 1.4) {
    const t = (r - inner) / (outer - inner);
    const alpha = Math.sin(t * Math.PI) * 0.5;
    ctx.strokeStyle = `${color}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.filter = "none";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  haloRingTextures.set(color, texture);
  return texture;
}

let sheenGlintTexture: THREE.Texture | null = null;

/** Small soft radial glint used as the pointer-tracking highlight on record
 * sleeves — a moving spot of light rather than a uniform wash. */
export function getSheenGlintTexture() {
  if (sheenGlintTexture) return sheenGlintTexture;
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  sheenGlintTexture = texture;
  return texture;
}

/** Small soft dot used for the floating dust/mote field. */
export function getMoteDotTexture() {
  if (moteDotTexture) return moteDotTexture;
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  moteDotTexture = texture;
  return texture;
}
