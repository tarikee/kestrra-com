/**
 * Encode the baked ground (pipeline/render_ground.py) for shipping.
 * Two crops: landscape for desktop, portrait for phones — where the still is
 * the only ground there is. Synthetic sRGB, so no ICC to carry; the toning is
 * generated in-gamut, never converted from anything.
 *
 * 4:4:4 — the chroma *is* the content here, and subsampled chroma blocks show
 * badly on a near-black field. Quality is high because smooth near-black
 * gradients band at low q; the files stay small regardless.
 *
 * Run: bun run pipeline/encode-ground.ts
 */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { stat } from "node:fs/promises";

const ROOT = dirname(import.meta.dir);

for (const name of ["ground", "ground-portrait"]) {
  const src = join(ROOT, `pipeline/.cache/${name}.png`);
  for (const [ext, run] of [
    ["avif", (s: sharp.Sharp) => s.avif({ quality: 70, effort: 6, chromaSubsampling: "4:4:4" })],
    ["webp", (s: sharp.Sharp) => s.webp({ quality: 82 })],
  ] as const) {
    const out = join(ROOT, "public/img", `${name}.${ext}`);
    await run(sharp(src)).toFile(out);
    console.log(`${name}.${ext}`, `${((await stat(out)).size / 1024).toFixed(0)}KB`);
  }
}
