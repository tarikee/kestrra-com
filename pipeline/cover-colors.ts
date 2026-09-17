/**
 * The colour strip, read from the cover frame.
 *
 * The strips were pooled across every frame in a set, which is defensible for
 * a set page but wrong where they actually appear: on the home page the strip
 * sits directly beside one photograph, and a viewer reads it as describing
 * *that* picture. Pooling made it describe an average of frames they cannot
 * see — so a cover full of orange neon could sit next to a strip of greys
 * legitimately drawn from the other fourteen frames.
 *
 * Keyed by set slug rather than by pool, because a set may merge pools and it
 * is the set that has a cover. `palettes.json` keeps its pooled colours and,
 * more importantly, its `spill` — that hex tones the live ground and the bake
 * and is not this script's business.
 *
 *     bun run pipeline/cover-colors.ts [--dry]
 *
 * Read-only over pixels, like measure-light.ts: shipped derivatives only,
 * never an original, never a re-encode.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { SETS } from "../content/sets";
import { clusterLab, signature } from "../lib/color/oklab";

const ROOT = dirname(import.meta.dir);
const IMG = join(ROOT, "public/img");
const OUT = join(ROOT, "data/generated/cover-colors.json");
const dry = process.argv.includes("--dry");

// not every frame carries every width — 04530-edit has no w640
const WIDTHS = [640, 1080, 1600, 2200, 2880];

const out: Record<string, string[]> = {};

for (const def of SETS) {
  const frame = def.frames.find((f) => f.id === def.cover) ?? def.frames[0];
  if (!frame) continue;
  const pool = frame.pool ?? def.pool;

  const src = WIDTHS.map((w) => join(IMG, pool, frame.id, `w${w}.avif`)).find(existsSync);
  if (!src) {
    console.warn(`  ${def.slug}: no derivative for cover ${pool}/${frame.id}, skipped`);
    continue;
  }

  const { data } = await sharp(src)
    .resize(128, 128, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  out[def.slug] = signature(clusterLab(data, { stride: 3 }), 5);
  console.log(`  ${def.slug.padEnd(22)} ${frame.id.padEnd(12)} ${out[def.slug].join(" ")}`);
}

if (dry) console.log(`\n  --dry: ${Object.keys(out).length} set(s), nothing written.`);
else {
  await writeFile(OUT, JSON.stringify(out, null, 1) + "\n");
  console.log(`\n  ${Object.keys(out).length} set(s) written to data/generated/cover-colors.json`);
}
