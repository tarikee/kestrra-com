/**
 * Kestrra asset pipeline.
 *
 * Reads originals from _assets-intake/, writes AVIF/WebP responsive sets into
 * public/img/, and emits data/generated/ manifests (dims, thumbhash LQIP,
 * EXIF subset, set palettes, spill hues, round-trip verification).
 *
 * The grade is untouchable: no colour operations of any kind. The source ICC
 * profile is carried onto every derivative (`keepIccProfile`); every other
 * metadata block (EXIF, GPS, XMP) is dropped from shipped files. Camera data
 * ships via the manifest, never via file metadata.
 *
 * Run: bun run assets [--only <slug>] [--sample]
 */
import sharp from "sharp";
import exifReader from "exif-reader";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { SETS, INTAKE, AVIF_WIDTHS, WEBP_WIDTHS, fileId, type SetInput } from "./config";

const ROOT = dirname(import.meta.dir); // kestrra-com/
const INTAKE_ABS = join(ROOT, INTAKE);
const OUT_IMG = join(ROOT, "public/img");
const OUT_DATA = join(ROOT, "data/generated");

const only = (() => {
  const i = process.argv.indexOf("--only");
  return i > -1 ? process.argv[i + 1] : null;
})();
const sample = process.argv.includes("--sample");

// ---------------------------------------------------------------- exif

interface ExifOut {
  camera?: string;
  lens?: string;
  focal?: number;
  aperture?: number;
  shutter?: string;
  iso?: number;
  date?: string;
  hadGps: boolean;
}

function fmtShutter(t?: number): string | undefined {
  if (!t || t <= 0) return undefined;
  if (t >= 1) return `${t}s`;
  return `1/${Math.round(1 / t)}`;
}

function parseExif(buf?: Buffer): ExifOut {
  if (!buf) return { hadGps: false };
  try {
    const raw = exifReader(buf) as Record<string, any>;
    const img = raw.Image ?? raw.image ?? {};
    const photo = raw.Photo ?? raw.exif ?? {};
    const gps = raw.GPSInfo ?? raw.gps;
    const date: Date | string | undefined =
      photo.DateTimeOriginal ?? photo.DateTimeDigitized ?? img.DateTime;
    return {
      camera: [img.Make, img.Model].filter(Boolean).join(" ").replace(/^Canon Canon/, "Canon"),
      lens: photo.LensModel ?? undefined,
      focal: photo.FocalLength ? Math.round(photo.FocalLength) : undefined,
      aperture: photo.FNumber ? Math.round(photo.FNumber * 10) / 10 : undefined,
      shutter: fmtShutter(photo.ExposureTime),
      iso: photo.ISOSpeedRatings ?? photo.PhotographicSensitivity ?? undefined,
      date: date instanceof Date ? date.toISOString() : typeof date === "string" ? date : undefined,
      hadGps: !!gps && Object.keys(gps).length > 0,
    };
  } catch {
    return { hadGps: false };
  }
}

// ------------------------------------------------------------- palette

type Px = [number, number, number];

function medianCut(pixels: Px[], count: number): Px[] {
  interface Box { px: Px[] }
  const boxes: Box[] = [{ px: pixels }];
  while (boxes.length < count) {
    boxes.sort((a, b) => spread(b.px) - spread(a.px));
    const box = boxes.shift();
    if (!box || box.px.length < 2) break;
    const ch = widestChannel(box.px);
    box.px.sort((a, b) => a[ch] - b[ch]);
    const mid = box.px.length >> 1;
    boxes.push({ px: box.px.slice(0, mid) }, { px: box.px.slice(mid) });
  }
  return boxes
    .map((b) => avg(b.px))
    .sort((a, b) => lum(b) * 0 + pop(b, boxes) - pop(a, boxes)); // keep stable order below
}

function widestChannel(px: Px[]): 0 | 1 | 2 {
  const min = [255, 255, 255], max = [0, 0, 0];
  for (const p of px) for (let c = 0; c < 3; c++) {
    if (p[c] < min[c]) min[c] = p[c];
    if (p[c] > max[c]) max[c] = p[c];
  }
  const d = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  return d.indexOf(Math.max(...d)) as 0 | 1 | 2;
}
function spread(px: Px[]): number {
  if (px.length === 0) return 0;
  const min = [255, 255, 255], max = [0, 0, 0];
  for (const p of px) for (let c = 0; c < 3; c++) {
    if (p[c] < min[c]) min[c] = p[c];
    if (p[c] > max[c]) max[c] = p[c];
  }
  return Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
}
function avg(px: Px[]): Px {
  const s = [0, 0, 0];
  for (const p of px) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; }
  const n = Math.max(px.length, 1);
  return [Math.round(s[0] / n), Math.round(s[1] / n), Math.round(s[2] / n)];
}
function lum(p: Px) { return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]; }
function pop(_p: Px, _b: unknown) { return 0; }
function hex(p: Px): string {
  return "#" + p.map((c) => c.toString(16).padStart(2, "0")).join("");
}

/** Circular-mean hue weighted by saturation; returns a quiet spill colour. */
function spillFrom(pixels: Px[]): string {
  let x = 0, y = 0, satSum = 0, n = 0;
  for (const [r, g, b] of pixels) {
    const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255;
    const l = (mx + mn) / 2;
    const s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
    if (l < 0.06 || l > 0.97) continue;
    let h = 0;
    const R = r / 255, G = g / 255, B = b / 255, d = mx - mn;
    if (d > 0) {
      if (mx === R) h = ((G - B) / d) % 6;
      else if (mx === G) h = (B - R) / d + 2;
      else h = (R - G) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    const w = s;
    x += Math.cos((h * Math.PI) / 180) * w;
    y += Math.sin((h * Math.PI) / 180) * w;
    satSum += s; n++;
  }
  if (n === 0) return "#3a3f3d";
  let hue = (Math.atan2(y, x) * 180) / Math.PI; if (hue < 0) hue += 360;
  const avgSat = satSum / n;
  const s = Math.min(Math.max(avgSat * 0.55, 0.10), 0.24);
  const l = 0.33;
  return hslHex(hue, s, l);
}
function hslHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const xx = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number] =
    h < 60 ? [c, xx, 0] : h < 120 ? [xx, c, 0] : h < 180 ? [0, c, xx]
    : h < 240 ? [0, xx, c] : h < 300 ? [xx, 0, c] : [c, 0, xx];
  return hex(rgb.map((v) => Math.round((v + m) * 255)) as Px);
}

// ------------------------------------------------------------ pipeline

interface ImageOut {
  id: string;
  w: number;
  h: number;
  avif: number[];
  webp: number[];
  thumbhash: string;
  thumb: string;
  dominant: string;
  exif: Omit<ExifOut, "hadGps">;
}

interface RoundTrip {
  set: string; id: string;
  meanDelta: number; p95Delta: number; maxDelta: number;
  iccOut: boolean; pass: boolean;
}

const roundtrips: RoundTrip[] = [];
const palettePixels: Record<string, Px[]> = {};
const dates: Record<string, string> = {};

async function processImage(set: SetInput, file: string): Promise<ImageOut> {
  const id = fileId(file);
  const srcPath = join(INTAKE_ABS, set.dir, file);
  const outDir = join(OUT_IMG, set.slug, id);
  await mkdir(outDir, { recursive: true });

  const base = sharp(srcPath, { limitInputPixels: 1e9 }).rotate();
  const meta = await base.metadata();
  const exif = parseExif(meta.exif as Buffer | undefined);
  if (exif.date) dates[`${set.slug}/${id}`] = exif.date;

  // Carry the source ICC profile byte-for-byte onto every derivative.
  let iccPath: string | null = null;
  if (meta.icc) {
    iccPath = join(ROOT, "pipeline/.cache", `icc-${Buffer.from(meta.icc).length}.icc`);
    if (!existsSync(iccPath)) {
      await mkdir(dirname(iccPath), { recursive: true });
      await writeFile(iccPath, meta.icc);
    }
  }

  // sanctioned crop only (selections.md)
  const crop = set.crops?.[id];
  let W = meta.width!, H = meta.height!;
  let pipe = base;
  if (crop?.top) {
    const cut = Math.round(H * crop.top);
    pipe = pipe.extract({ left: 0, top: cut, width: W, height: H - cut });
    H = H - cut;
  }
  // Decode once to raw pixels — lossless intermediate, zero generation loss.
  const rawBuf = await pipe.raw().toBuffer();
  const rawSpec = { raw: { width: W, height: H, channels: 3 as const }, limitInputPixels: 1e9 };
  const src = sharp(rawBuf, rawSpec);
  const icc = iccPath ?? "srgb";

  const avifDone: number[] = [];
  for (const w of AVIF_WIDTHS) {
    if (w > W) break;
    const q = w >= 2880 ? 60 : w >= 1600 ? 58 : 55;
    await src
      .clone()
      .resize({ width: w })
      .avif({ quality: q, effort: 4, chromaSubsampling: w >= 2880 ? "4:4:4" : "4:2:0" })
      .withIccProfile(icc)
      .toFile(join(outDir, `w${w}.avif`));
    avifDone.push(w);
  }
  const webpDone: number[] = [];
  for (const w of WEBP_WIDTHS) {
    if (w > W) break;
    await src
      .clone()
      .resize({ width: w })
      .webp({ quality: 80, smartSubsample: true })
      .withIccProfile(icc)
      .toFile(join(outDir, `w${w}.webp`));
    webpDone.push(w);
  }

  // thumbhash LQIP
  const tw = W >= H ? 100 : Math.round((100 * W) / H);
  const th = W >= H ? Math.round((100 * H) / W) : 100;
  const { data: rgba } = await src
    .clone()
    .resize(tw, th, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hash = rgbaToThumbHash(tw, th, rgba);
  const thumb = thumbHashToDataURL(hash);

  // palette + dominant
  const { data: pal } = await src.clone().resize(48, 48, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const pxs: Px[] = [];
  for (let i = 0; i < pal.length; i += 3) pxs.push([pal[i], pal[i + 1], pal[i + 2]]);
  (palettePixels[set.slug] ??= []).push(...pxs);
  const stats = await src.clone().stats();
  const dom = hex([stats.dominant.r, stats.dominant.g, stats.dominant.b]);

  // round-trip verification against the largest AVIF
  const bigW = avifDone[avifDone.length - 1];
  const derived = sharp(join(outDir, `w${bigW}.avif`));
  const dMeta = await derived.metadata();
  const iccOut = !!dMeta.icc;
  const wS = 480; // compare at a common size — codecs differ per-pixel, colour must not
  const a = await src.clone().resize({ width: wS }).raw().toBuffer();
  const b = await derived.resize({ width: wS }).raw().toBuffer();
  let sum = 0; const deltas: number[] = [];
  const stride = Math.max(3, Math.floor(Math.min(a.length, b.length) / (500 * 3)) * 3);
  let count = 0;
  for (let i = 0; i + 2 < Math.min(a.length, b.length); i += stride) {
    const d = (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 3;
    sum += d; deltas.push(d); count++;
  }
  deltas.sort((x, y) => x - y);
  const mean = sum / Math.max(count, 1);
  const p95 = deltas[Math.floor(deltas.length * 0.95)] ?? 0;
  const max = deltas[deltas.length - 1] ?? 0;
  roundtrips.push({
    set: set.slug, id,
    meanDelta: Math.round(mean * 100) / 100,
    p95Delta: Math.round(p95 * 100) / 100,
    maxDelta: Math.round(max * 100) / 100,
    iccOut,
    pass: iccOut && mean < 3 && p95 < 10,
  });

  const { hadGps: _gps, ...exifShip } = exif;
  return { id, w: W, h: H, avif: avifDone, webp: webpDone, thumbhash: Buffer.from(hash).toString("base64"), thumb, dominant: dom, exif: exifShip };
}

// ---------------------------------------------------------------- main

async function main() {
  const t0 = Date.now();
  await mkdir(OUT_DATA, { recursive: true });
  const manifest: Record<string, ImageOut[]> = {};
  const sets = SETS.filter((s) => !only || s.slug === only);

  for (const set of sets) {
    const files = sample ? set.files.slice(0, 2) : set.files;
    console.log(`\n■ ${set.slug} — ${files.length} frames`);
    const out: ImageOut[] = [];
    const queue = [...files];
    const workers = Array.from({ length: 3 }, async () => {
      while (queue.length) {
        const f = queue.shift()!;
        const r = await processImage(set, f);
        out.push(r);
        console.log(`  ${r.id}  ${r.w}×${r.h}  avif:${r.avif.length} webp:${r.webp.length}`);
      }
    });
    await Promise.all(workers);
    // keep config order
    out.sort((a, b) => files.findIndex((f) => fileId(f) === a.id) - files.findIndex((f) => fileId(f) === b.id));
    manifest[set.slug] = out;
  }

  // per-set palettes + spill
  const palettes: Record<string, { colors: string[]; spill: string }> = {};
  for (const [slug, pxs] of Object.entries(palettePixels)) {
    const sampled = pxs.filter((_, i) => i % 7 === 0);
    const colors = medianCut(sampled, 5).sort((a, b) => lum(b) - lum(a)).map(hex);
    palettes[slug] = { colors, spill: spillFrom(sampled) };
  }

  // merge with existing manifests when running --only
  const mPath = join(OUT_DATA, "images.json");
  const pPath = join(OUT_DATA, "palettes.json");
  let existingM: Record<string, ImageOut[]> = {};
  let existingP: Record<string, unknown> = {};
  if (only && existsSync(mPath)) existingM = JSON.parse(await readFile(mPath, "utf8"));
  if (only && existsSync(pPath)) existingP = JSON.parse(await readFile(pPath, "utf8"));

  await writeFile(mPath, JSON.stringify({ ...existingM, ...manifest }, null, 1));
  await writeFile(pPath, JSON.stringify({ ...existingP, ...palettes }, null, 1));
  await writeFile(join(OUT_DATA, "dates.json"), JSON.stringify(dates, null, 1));
  await writeFile(join(OUT_DATA, "roundtrip.json"), JSON.stringify(roundtrips, null, 1));

  const failed = roundtrips.filter((r) => !r.pass);
  console.log(`\n✓ ${roundtrips.length} images in ${Math.round((Date.now() - t0) / 1000)}s`);
  if (failed.length) {
    console.log(`✗ ROUND-TRIP FLAGS (${failed.length}):`);
    for (const f of failed) console.log(`  ${f.set}/${f.id} mean=${f.meanDelta} p95=${f.p95Delta} icc=${f.iccOut}`);
  } else {
    console.log("✓ round-trip clean: ICC on every derivative, colour deltas within codec noise");
  }
}

main();
