/** Module-level cache: keyed canvases keyed by image src so multiple
 * FloatingElements sharing a sprite don't redo the flood-fill matte. */
const keyedCache = new Map<string, HTMLCanvasElement>();

export type KeyMode = "lotus" | "pad";

type KeyOptions = {
  tolerance?: number;
  feather?: number;
  /** lotus keeps crisp opaque petals; pad settles into pond tone */
  mode?: KeyMode;
};

/** Removes a plain white background from a loaded image, returning a new
 * canvas with alpha transparency. Flood-fills from the borders so bright
 * petal/leaf highlights inside the subject are not erased. */
export function keyOutWhite(
  image: HTMLImageElement,
  {
    tolerance = 26,
    feather = 20,
    mode = "pad",
  }: KeyOptions = {},
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.drawImage(image, 0, 0);
  const { width, height } = canvas;
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let br = 0;
  let bgc = 0;
  let bb = 0;
  for (const [cx, cy] of corners) {
    const i = (cy * width + cx) * 4;
    br += data[i];
    bgc += data[i + 1];
    bb += data[i + 2];
  }
  br /= corners.length;
  bgc /= corners.length;
  bb /= corners.length;

  function colorDist(i: number) {
    const dr = data[i] - br;
    const dg = data[i + 1] - bgc;
    const db = data[i + 2] - bb;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  const bgMask = new Uint8Array(width * height);
  const queue: number[] = [];

  function tryEnqueue(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (bgMask[idx]) return;
    if (colorDist(idx * 4) <= tolerance) {
      bgMask[idx] = 1;
      queue.push(idx);
    }
  }

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop() as number;
    const x = idx % width;
    const y = (idx / width) | 0;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      if (bgMask[idx]) {
        data[i + 3] = 0;
        continue;
      }

      let nearBackground = false;
      for (let dy = -1; dy <= 1 && !nearBackground; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (bgMask[ny * width + nx]) {
            nearBackground = true;
            break;
          }
        }
      }
      if (!nearBackground) continue;

      const dist = colorDist(i);
      if (dist < tolerance + feather) {
        const alpha = Math.max(0, Math.min(1, (dist - tolerance) / feather));
        data[i + 3] = Math.round(data[i + 3] * alpha);
      }
    }
  }

  ctx.putImageData(frame, 0, 0);

  if (mode === "pad") {
    tintWetEdges(ctx, width, height, [10, 42, 36], 0.48);
    settleIntoPond(ctx, width, height);
  } else {
    // Lotus: keep petal color intact — only a whisper of wet fringe at the base
    tintWetEdges(ctx, width, height, [18, 55, 48], 0.18);
    sealLotusOpacity(ctx, width, height);
  }

  return canvas;
}

/** Soft teal fringe on edges — strength depends on flora type. */
function tintWetEdges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  water: [number, number, number] = [10, 42, 36],
  maxWet = 0.48,
) {
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0 || a >= 245) continue;
    const y = ((i / 4) / width) | 0;
    // Lotuses only wet near the bottom contact; pads wet all soft edges
    const depthBias = maxWet < 0.3 ? Math.max(0, (y / height - 0.55) / 0.45) : 1;
    const wet = Math.min(maxWet, (1 - a / 255) * 1.15 * depthBias);
    if (wet <= 0.03) continue;
    data[i] = Math.round(data[i] * (1 - wet) + water[0] * wet);
    data[i + 1] = Math.round(data[i + 1] * (1 - wet) + water[1] * wet);
    data[i + 2] = Math.round(data[i + 2] * (1 - wet) + water[2] * wet);
    data[i + 3] = Math.round(a * (1 - wet * 0.1));
  }
  ctx.putImageData(frame, 0, 0);
}

/** Ensure lotus petals stay fully opaque — no ghost / foggy alpha. */
function sealLotusOpacity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 40 && a < 252) {
      // Snap near-solid petal pixels to full opacity so they read crisp
      data[i + 3] = a > 120 ? 255 : Math.min(255, Math.round(a * 1.35));
    }
  }
  ctx.putImageData(frame, 0, 0);
}

/** Pull sticker-bright highlights into pond light — pads only. */
function settleIntoPond(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;
  const pond: [number, number, number] = [14, 48, 40];

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 8) continue;
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > 175) {
      const crush = Math.min(0.7, (lum - 175) / 80);
      r = Math.round(r * (1 - crush) + 55 * crush);
      g = Math.round(g * (1 - crush) + 95 * crush);
      b = Math.round(b * (1 - crush) + 75 * crush);
    }

    const ambient = 0.12;
    r = Math.round(r * (1 - ambient) + pond[0] * ambient);
    g = Math.round(g * (1 - ambient) + pond[1] * ambient);
    b = Math.round(b * (1 - ambient) + pond[2] * ambient);

    const y = ((i / 4) / width) | 0;
    const depth = y / height;
    if (depth > 0.55) {
      const soak = (depth - 0.55) * 0.45;
      r = Math.round(r * (1 - soak) + pond[0] * soak);
      g = Math.round(g * (1 - soak) + pond[1] * soak);
      b = Math.round(b * (1 - soak) + pond[2] * soak);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(frame, 0, 0);
}

/** Load + matte a sprite once per src, reusing the result across floaters. */
export function loadKeyedSprite(
  src: string,
  { tolerance = 30, feather = 18, mode = "pad" }: KeyOptions = {},
): Promise<HTMLCanvasElement> {
  const cacheKey = `${src}|${tolerance}|${feather}|${mode}|v3`;
  const hit = keyedCache.get(cacheKey);
  if (hit) return Promise.resolve(hit);

  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const matted = keyOutWhite(image, { tolerance, feather, mode });
      keyedCache.set(cacheKey, matted);
      resolve(matted);
    };
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}
