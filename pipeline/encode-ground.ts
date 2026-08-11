/**
 * Encode the baked ground (pipeline/render_ground.py) for shipping.
 * Synthetic zero-chroma image — no ICC concerns, plain sRGB. High quality:
 * smooth near-black gradients band at low q, and the file stays tiny anyway.
 *
 * Run: bun run pipeline/encode-ground.ts
 */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { stat } from "node:fs/promises";

const ROOT = dirname(import.meta.dir);
const SRC = join(ROOT, "pipeline/.cache/ground.png");

for (const [file, run] of [
  ["ground.avif", (s: sharp.Sharp) => s.avif({ quality: 62, effort: 6, chromaSubsampling: "4:2:0" })],
  ["ground.webp", (s: sharp.Sharp) => s.webp({ quality: 78 })],
] as const) {
  const out = join(ROOT, "public/img", file);
  await run(sharp(SRC)).toFile(out);
  console.log(file, `${((await stat(out)).size / 1024).toFixed(0)}KB`);
}
