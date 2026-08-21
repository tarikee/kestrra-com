/**
 * Measure the light in every shipped frame.
 *
 * The Gallery orders the whole corpus by exposure — darkest to most blown —
 * so it needs a real number per frame, not the coarse low/mid/high labels in
 * data/image-analysis.md (which only ever covered the 63 personal-archive
 * images, and never the commissioned sets).
 *
 * Read-only. This measures already-shipped derivatives and writes a manifest;
 * it never re-encodes, never opens an original, and never touches a pixel that
 * ships. Run it after `bun run assets`, or any time frames are added:
 *
 *     bun run pipeline/measure-light.ts
 *
 * Three numbers per frame, all 0–1:
 *   lum    mean relative luminance (Rec.709 on linearised sRGB) — where the
 *          frame sits on the ramp. Linear light, because a mean taken on
 *          gamma-encoded values overstates the darks badly and every night
 *          frame would sort as mid-key.
 *   hi     fraction of pixels above 0.92 — the blown highlights. Two frames
 *          can share a mean and read completely differently if one of them
 *          has a white sky in it.
 *   spread standard deviation of luminance — flat fog versus hard contrast.
 *
 * The sort key is a blend of lum and hi: what the eye calls "bright" is
 * mostly driven by the highlights, not the average.
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const IMG = "public/img";
const OUT = "data/generated/luminance.json";

/** sRGB transfer → linear, so the mean is a mean of actual light */
const LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LINEAR[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

interface Light {
  lum: number;
  hi: number;
  spread: number;
  /** the ramp position the gallery sorts on */
  key: number;
}

async function measure(file: string): Promise<Light> {
  // small is plenty — this is a global statistic, and the 640px derivative
  // is the one already on disk for every frame
  const { data, info } = await sharp(file)
    .resize(160, 160, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const n = info.width * info.height;
  let sum = 0;
  let sumSq = 0;
  let blown = 0;
  for (let p = 0; p < data.length; p += info.channels) {
    const y =
      0.2126 * LINEAR[data[p]] + 0.7152 * LINEAR[data[p + 1]] + 0.0722 * LINEAR[data[p + 2]];
    sum += y;
    sumSq += y * y;
    if (y > 0.92) blown++;
  }
  const lum = sum / n;
  const spread = Math.sqrt(Math.max(0, sumSq / n - lum * lum));
  const hi = blown / n;
  // highlights dominate the read, so they carry most of the weight; the
  // cube root pulls the long dark tail apart, which is where two thirds of
  // this archive lives
  const key = Math.cbrt(lum) * 0.55 + Math.min(1, hi * 3.2) * 0.45;
  return { lum: r(lum), hi: r(hi), spread: r(spread), key: r(key) };
}

const r = (v: number) => Math.round(v * 10000) / 10000;

const out: Record<string, Light> = {};
const pools = (await readdir(IMG, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const pool of pools) {
  const ids = (await readdir(join(IMG, pool), { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const id of ids) {
    const file = join(IMG, pool, id, "w640.avif");
    try {
      out[`${pool}/${id}`] = await measure(file);
    } catch {
      console.warn(`  skipped ${pool}/${id} — no w640.avif`);
    }
  }
}

const sorted = Object.entries(out).sort((a, b) => a[1].key - b[1].key);
await writeFile(OUT, JSON.stringify(Object.fromEntries(sorted), null, 1) + "\n");

console.log(`measured ${sorted.length} frames → ${OUT}`);
console.log("darkest :", sorted.slice(0, 4).map(([k, v]) => `${k} ${v.key}`).join("  "));
console.log("brightest:", sorted.slice(-4).map(([k, v]) => `${k} ${v.key}`).join("  "));
