/**
 * Rebuild the per-set colour strips in place.
 *
 * The strips in data/generated/palettes.json were produced by median cut in
 * RGB, each box collapsed to its arithmetic mean — which desaturates toward
 * grey and can name a colour that is nowhere in the work. They are now
 * clustered in OKLab instead (lib/color/oklab.ts). This recomputes them for
 * the corpus that is already shipped, so the fix lands without a full asset
 * rebuild.
 *
 *     bun run pipeline/recolor-strips.ts [--dry]
 *
 * Read-only over pixels, exactly like measure-light.ts: it reads the smallest
 * shipped AVIF of every frame, never opens an original, never re-encodes, and
 * never writes an image. The only file it writes is palettes.json.
 *
 * `spill` is deliberately NOT touched. That hex tones the live ground, the
 * baked ground and CORPUS_SPILL in lib/work.ts; changing it is a change to
 * the colour of the entire site, which is not what this fixes.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { clusterLab, signature } from "../lib/color/oklab";

const ROOT = dirname(import.meta.dir);
const IMG = join(ROOT, "public/img");
const DATA = join(ROOT, "data/generated");
const dry = process.argv.includes("--dry");

interface ManifestImage { id: string; }
type Palettes = Record<string, { colors: string[]; spill: string }>;

const images = JSON.parse(await readFile(join(DATA, "images.json"), "utf8")) as Record<string, ManifestImage[]>;
const palettes = JSON.parse(await readFile(join(DATA, "palettes.json"), "utf8")) as Palettes;

let changed = 0;
let missing = 0;

for (const [pool, frames] of Object.entries(images)) {
  const entry = palettes[pool];
  if (!entry) {
    console.warn(`  ${pool}: no palette entry, skipped`);
    continue;
  }

  // 48×48 per frame, same sample size the pipeline uses, pooled across the set
  const pooled: number[] = [];
  for (const f of frames) {
    const src = join(IMG, pool, f.id, "w640.avif");
    if (!existsSync(src)) { missing++; continue; }
    const { data } = await sharp(src)
      .resize(48, 48, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 3) pooled.push(data[i], data[i + 1], data[i + 2]);
  }
  if (!pooled.length) { console.warn(`  ${pool}: no derivatives found, skipped`); continue; }

  const before = entry.colors;
  const after = signature(clusterLab(Uint8Array.from(pooled), { stride: 3 }), 5);
  const same = before.length === after.length && before.every((c, i) => c === after[i]);

  console.log(`\n  ${pool}  (${frames.length} frames)`);
  console.log(`    was  ${before.join(" ")}`);
  console.log(`    now  ${after.join(" ")}${same ? "   (unchanged)" : ""}`);

  if (!same) { entry.colors = after; changed++; }
}

if (missing) console.log(`\n  ${missing} frame(s) had no w640.avif on disk and were skipped.`);

if (dry) {
  console.log(`\n  --dry: ${changed} set(s) would change, nothing written.`);
} else if (changed) {
  await writeFile(join(DATA, "palettes.json"), JSON.stringify(palettes, null, 1) + "\n");
  console.log(`\n  ${changed} set(s) rewritten in data/generated/palettes.json. spill untouched.`);
} else {
  console.log("\n  Nothing to change.");
}
