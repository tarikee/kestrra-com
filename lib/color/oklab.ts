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
 * The colour signature printed under a set — five colours that are actually
 * in the work, ordered light to dark the way the strip has always shown them.
 *
 * Stratified by tone, not by population. Simply taking the heaviest cells is
 * the obvious thing and it fails on photographs for a reason that is obvious
 * in hindsight: most of a photograph is shadow, so the top five cells come
 * back as five barely-different darks, and a strip that ends in two blacks
 * tells a client nothing.
 *
 * Banding by tonal *mass* is the tempting fix and it fails the same way:
 * most of a photograph's mass is dark, so even the brightest fifth of it
 * lands in the mid-shadows and the strip loses its light end entirely. What
 * the eye calls the highlights is a small number of pixels carrying most of
 * the impression — the same reasoning measure-light.ts already applies when
 * it ranks the wall.
 *
 * So the band is the lightness *range* the set occupies, cut into `count`
 * equal intervals, each electing its own heaviest cell. The ramp then spans
 * what the work actually spans, reads light to dark by construction, and no
 * interval can be outvoted by a larger one elsewhere.
 *
 * Within an interval the vote leans slightly toward chroma: a neutral and a
 * colour of equal area are not equally informative about a body of work. Only
 * slightly, or one small vivid thing would misrepresent a quiet set.
 */
export function signature(clusters: LabCluster[], count = 5): string[] {
  // drop the noise floor — single-cell specks are not part of a signature,
  // and without this one stray highlight would define the whole light end
  const cells = clusters.filter((c) => c.weight >= 0.0015);
  if (!cells.length) return clusters.slice(0, count).map((c) => hexOf(oklabToRgb(c.lab)));

  const Ls = cells.map((c) => c.lab[0]);
  const lo = Math.min(...Ls);
  const hi = Math.max(...Ls);
  const span = hi - lo;
  if (span < 1e-4) return [hexOf(oklabToRgb(cells[0].lab))];

  const vote = (c: LabCluster) => c.weight * (1 + chromaOf(c.lab) * 1.5);
  const picked: LabCluster[] = [];

  for (let b = count - 1; b >= 0; b--) {
    const from = lo + (span * b) / count;
    const to = b === count - 1 ? hi + 1e-6 : lo + (span * (b + 1)) / count;
    const band = cells.filter((c) => c.lab[0] >= from && c.lab[0] < to);
    if (!band.length) continue; // a gap in the ramp is honest; don't invent one
    picked.push(band.reduce((best, c) => (vote(c) > vote(best) ? c : best)));
  }

  return picked.map((c) => hexOf(oklabToRgb(c.lab)));
}
