/**
 * 2Hot4Stage scroll-orbit frames — DESIGN.md §7b.
 *
 * iva3d_v3.mov (1080×1920, 147 frames) → every 2nd frame → 74 AVIF frames at
 * 720×1280, total budget ≤ ~1.5MB. The grey studio backdrop is kept honest —
 * lit-aperture presentation, no matting.
 *
 * Run: bun run pipeline/build-orbit.ts
 */
import sharp from "sharp";
import { mkdir, writeFile, readdir, stat, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";

const ROOT = dirname(import.meta.dir);
const SRC = join(ROOT, "../_assets-intake/events/2hot4stage/3d/iva3d_v3.mov");
const TMP = join(ROOT, "pipeline/.cache/orbit-frames");
const OUT = join(ROOT, "public/img/orbit");
const BUDGET = 1.55 * 1024 * 1024;

async function encodeAll(pngs: string[], quality: number): Promise<number> {
  let total = 0;
  let i = 0;
  const queue = [...pngs];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const png = queue.shift()!;
      const idx = pngs.indexOf(png);
      const out = join(OUT, `${String(idx).padStart(3, "0")}.avif`);
      await sharp(join(TMP, png))
        .avif({ quality, effort: 4, chromaSubsampling: "4:2:0" })
        .toFile(out);
      total += (await stat(out)).size;
      i++;
    }
  });
  await Promise.all(workers);
  return total;
}

async function main() {
  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });
  await mkdir(OUT, { recursive: true });

  execSync(
    `ffmpeg -y -v error -i "${SRC}" -vf "select='not(mod(n,2))',scale=720:1280:flags=lanczos" -fps_mode vfr "${TMP}/%03d.png"`,
    { stdio: "inherit" }
  );
  let pngs = (await readdir(TMP)).filter((f) => f.endsWith(".png")).sort();
  // per Tarik (2026-08-11): only the first third of the orbit ships — it
  // carries the actual rotation; the rest of the footage is cut
  pngs = pngs.slice(0, Math.ceil(pngs.length / 3));
  console.log(`extracted ${pngs.length} frames (first third kept)`);

  let q = 44;
  let total = await encodeAll(pngs, q);
  console.log(`q${q}: ${(total / 1024).toFixed(0)}KB total`);
  if (total > BUDGET) {
    q = Math.max(26, Math.round(q * Math.pow(BUDGET / total, 0.8)));
    total = await encodeAll(pngs, q);
    console.log(`q${q}: ${(total / 1024).toFixed(0)}KB total`);
  }

  // poster (reduced-motion fallback + pre-arm placeholder) from mid-orbit frame
  const posterSrc = join(TMP, pngs[Math.floor(pngs.length / 2)]);
  await sharp(posterSrc).avif({ quality: 55, effort: 4 }).toFile(join(OUT, "poster.avif"));
  const { data, info } = await sharp(posterSrc)
    .resize(56, 100, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hash = rgbaToThumbHash(info.width, info.height, data);

  await writeFile(
    join(ROOT, "data/generated/orbit.json"),
    JSON.stringify(
      {
        frames: pngs.length,
        w: 720,
        h: 1280,
        pattern: "/img/orbit/{i}.avif",
        pad: 3,
        poster: "/img/orbit/poster.avif",
        thumb: thumbHashToDataURL(hash),
        bytes: total,
        quality: q,
      },
      null,
      1
    )
  );
  console.log(`✓ orbit: ${pngs.length} frames, ${(total / 1024).toFixed(0)}KB, q${q}`);
}

main();
