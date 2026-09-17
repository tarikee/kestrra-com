/**
 * Reading colour out of a photograph, honestly.
 *
 * Shared by the browser (lib/export/palette.ts, the share card's picker) and
 * the pipeline (pipeline/build-assets.ts, the per-set colour strips) so the
 * two can never disagree about what colour a picture is. Pure maths — no DOM,
 * no sharp, no I/O — which is the only reason both can import it.
 *
 * ── Why not the obvious thing ────────────────────────────────────────────
 * The first version of the strip used median cut in RGB and collapsed each
 * box to its arithmetic mean. Both halves of that are wrong for photographs:
 *
 *   · RGB distance is a poor model of "these two look alike". Two dark browns
 *     can sit further apart in RGB than a brown and a blue, so a box ends up
 *     spanning colours the eye calls different, and splitting on the widest
 *     *channel* compounds it.
 *   · The mean of a box that spans several hues lands near the grey axis.
 *     Average a red dress against green foliage and you get mud — a colour
 *     that appears nowhere in the frame, presented to a colourist's client
 *     as their palette.
 *
 * So: bucket in OKLab, which is near enough perceptually uniform that equal
 * distances mean equal difference, and let population decide. What comes back
 * are colours you can point at in the picture.
 */

export type Lab = [number, number, number]; // L, a, b
export type Rgb = [number, number, number]; // 0..1

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** sRGB (0..1) → OKLab. Björn Ottosson's transform. */
export function rgbToOklab(r: number, g: number, b: number): Lab {
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab → sRGB (0..1), clamped into gamut. */
export function oklabToRgb([L, a, b]: Lab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const c = (x: number) => Math.min(1, Math.max(0, x));
  return [
    c(gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    c(gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    c(gam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
  ];
}

export const chromaOf = ([, a, b]: Lab): number => Math.hypot(a, b);

export function hexOf([r, g, b]: Rgb): string {
  const h = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function hexToRgb(s: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(s.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export interface LabCluster {
  /** mean of what landed in this cell */
  lab: Lab;
  /** share of counted pixels, 0..1 */
  weight: number;
}

export interface ClusterOpts {
  /** bytes per pixel — 4 for ImageData, 3 for sharp's raw RGB */
  stride?: number;
  /** reject a pixel before it is counted (used to cluster only highlights) */
  keep?: (lab: Lab) => boolean;
}

/**
 * Bucket every pixel into a coarse OKLab grid; return the populated cells
 * heaviest first, each collapsed to the mean of its own contents.
 *
 * The grid is fine in a/b so two different hues never share a cell, and
 * coarse in L so the same colour in shade and in sun counts once rather than
 * splitting its own vote. A cell's mean is safe precisely because everything
 * in it is already perceptually close — which is what the RGB version could
 * not promise.
 */
export function clusterLab(
  data: ArrayLike<number>,
  { stride = 4, keep }: ClusterOpts = {}
): LabCluster[] {
  const bins = new Map<number, { L: number; a: number; b: number; n: number }>();
  let total = 0;

  for (let i = 0; i + stride - 1 < data.length; i += stride) {
    if (stride === 4 && data[i + 3] < 128) continue;
    const lab = rgbToOklab(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
    if (keep && !keep(lab)) continue;
    const kl = Math.min(5, Math.max(0, Math.floor(lab[0] * 6)));
    const ka = Math.min(15, Math.max(0, Math.floor((lab[1] + 0.4) * 20)));
    const kb = Math.min(15, Math.max(0, Math.floor((lab[2] + 0.4) * 20)));
    const key = (kl << 8) | (ka << 4) | kb;
    const cell = bins.get(key);
    if (cell) {
      cell.L += lab[0]; cell.a += lab[1]; cell.b += lab[2]; cell.n++;
    } else {
      bins.set(key, { L: lab[0], a: lab[1], b: lab[2], n: 1 });
    }
    total++;
  }
  if (!total) return [];

  return [...bins.values()]
    .map((c) => ({ lab: [c.L / c.n, c.a / c.n, c.b / c.n] as Lab, weight: c.n / total }))
    .sort((x, y) => y.weight - x.weight);
}

/** The Lth percentile of lightness across the sample — used to split the
    highlights off without assuming where they start. */
export function lightnessCut(data: ArrayLike<number>, p: number, stride = 4): number {
  const ls: number[] = [];
  for (let i = 0; i + stride - 1 < data.length; i += stride) {
    ls.push(rgbToOklab(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255)[0]);
  }
  if (!ls.length) return 0.5;
  ls.sort((a, b) => a - b);
  return ls[Math.min(ls.length - 1, Math.floor(ls.length * p))];
}

/**
 * The colour signature printed under a set — five colours that actually
 * characterise the work, ordered light to dark as the strip has always shown.
 *
 * The hard part is not finding the colours, it is deciding which five matter.
 * Two attempts got this wrong in instructive ways:
 *
 * 1. **Heaviest cells win.** Returns five barely-different darks: most of a
 *    photograph is shadow.
 * 2. **Band by lightness, heaviest cell per band, mild chroma bonus.** Looks
 *    principled and still fails, because area beats colour. A frame built
 *    around an orange neon ring came back as grey, grey, brown, teal, black
 *    — no orange anywhere. Chroma in OKLab runs about 0.02–0.15, so a
 *    `1 + chroma × 1.5` bonus is worth ~18% to a vivid colour, and a flat
 *    wall with ten times the area takes the slot regardless.
 *
 * What a signature is *for* is the answer: it should carry the colours you
 * would name if asked what colour a picture is. So area is compressed to a
 * fractional power — it still matters, a stray pixel still cannot win — and
 * chroma is a strong multiplier rather than a rounding error. Selection is
 * then greedy with a perceptual-distance floor, which keeps the five apart
 * without ever banding them arbitrarily, and the distance counts the opponent
 * axes above lightness so two different hues never collapse into one slot.
 */
const AREA_POWER = 0.4; // compress area: 10x the pixels is worth ~2.5x, not 10x
const CHROMA_GAIN = 14; // colour is the point of a colour signature

function score(c: LabCluster): number {
  return Math.pow(c.weight, AREA_POWER) * (1 + chromaOf(c.lab) * CHROMA_GAIN);
}

/** Perceptual gap, weighted toward hue: a colour and a neutral of the same
    lightness are different swatches; two neutrals a shade apart are not. */
function gap(a: Lab, b: Lab): number {
  return Math.hypot((a[0] - b[0]) * 0.9, (a[1] - b[1]) * 1.6, (a[2] - b[2]) * 1.6);
}

/**
 * Scoring alone is not enough either. Letting one number choose all five
 * slots just moves the failure: with chroma weighted heavily enough to
 * surface an orange neon, a set with strong foliage came back as five greens
 * with no light value left in it. Area-wins and colour-wins are the same
 * mistake pointing in opposite directions.
 *
 * A palette has *roles*. Pulling one off a photograph by hand, you take a
 * light value, a dark value, and the hues that give the thing its character —
 * so the slots are reserved that way. The anchors keep the tonal ramp the
 * strip has always read as; the character picks are free to be vivid without
 * having to outvote a wall to get in.
 */
export function signature(clusters: LabCluster[], count = 5): string[] {
  // drop the noise floor — single-cell specks are not part of a signature
  const cells = clusters.filter((c) => c.weight >= 0.0015);
  if (!cells.length) return clusters.slice(0, count).map((c) => hexOf(oklabToRgb(c.lab)));
  if (cells.length <= count) {
    return [...cells].sort((a, b) => b.lab[0] - a.lab[0]).map((c) => hexOf(oklabToRgb(c.lab)));
  }

  // the anchors want a little more presence than a character colour does, or
  // one blown highlight becomes the light end of the whole set
  const solid = cells.filter((c) => c.weight >= 0.006);
  const pool = solid.length >= 2 ? solid : cells;
  const light = pool.reduce((a, b) => (b.lab[0] > a.lab[0] ? b : a));
  const dark = pool.reduce((a, b) => (b.lab[0] < a.lab[0] ? b : a));

  const picked: LabCluster[] = [light];
  if (gap(dark.lab, light.lab) > 1e-6) picked.push(dark);

  // the character colours, most distinctive first, each far enough from
  // everything already held that it reads as its own swatch
  const ranked = [...cells].sort((x, y) => score(y) - score(x));
  for (const minGap of [0.13, 0.09, 0.06, 0.04, 0.02]) {
    for (const c of ranked) {
      if (picked.length >= count) break;
      if (picked.every((p) => gap(p.lab, c.lab) >= minGap)) picked.push(c);
    }
    if (picked.length >= count) break;
  }

  return picked
    .sort((a, b) => b.lab[0] - a.lab[0])
    .map((c) => hexOf(oklabToRgb(c.lab)));
}
