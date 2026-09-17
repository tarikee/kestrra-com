/**
 * The share card's colour picker — a few colours read out of the photograph,
 * never a hue wheel.
 *
 * DESIGN.md §6 is the constraint: the room's hue only ever comes from the
 * work. A spectrum would let you put a colour in the room that is nowhere in
 * the picture, which is precisely the thing the site does not do. So you
 * choose which *question* to ask of the frame, and every answer is a colour
 * that is genuinely in it.
 *
 * The clustering lives in lib/color/oklab.ts, shared with the pipeline that
 * builds the per-set colour strips, so the picker and the strips agree.
 *
 * Read-only over already-shipped derivatives. Nothing here modifies a pixel
 * of the photograph — the grade is untouchable (CLAUDE.md).
 */
import { CORPUS_SPILL } from "@/lib/ground-shader";
import {
  clusterLab,
  lightnessCut,
  oklabToRgb,
  hexOf,
  chromaOf,
  type Lab,
} from "@/lib/color/oklab";
import type { ToneCandidate, ToneId } from "./types";

/**
 * The ground takes a colour as *light*, and light with no lightness does
 * nothing — a spill sampled from a near-black shadow would tone the room by
 * nothing at all. So a candidate is normalised to a consistent level before
 * it is handed over: the hue and the chroma ratio are the picture's, the
 * level is the room's. tone() in ground-shader.ts does the rest, and its own
 * normalisation is what stops a loud frame shouting louder than a quiet one.
 */
const asSpill = (lab: Lab): string =>
  chromaOf(lab) < 1e-4 ? CORPUS_SPILL : hexOf(oklabToRgb([0.55, lab[1], lab[2]]));

/**
 * The swatch previews the *tone*, not the pixel.
 *
 * Showing the raw colour as it reads in the photograph is the obvious choice
 * and it misleads: tone() normalises chroma to a fixed level, so two muted
 * candidates whose raw swatches look like the same grey will light the room
 * in visibly different hues. A picker whose chips all look alike on a quiet
 * frame is hiding choices that actually exist.
 *
 * So the chip carries the candidate's hue at a consistent chroma and
 * lightness — the same normalisation the ground applies — which makes it an
 * honest preview of what picking it will do.
 */
const SWATCH_CHROMA = 0.085;
const asSwatch = (lab: Lab): string => {
  const c = chromaOf(lab);
  if (c < 1e-5) return "#6d6760";
  const k = SWATCH_CHROMA / c;
  return hexOf(oklabToRgb([0.62, lab[1] * k, lab[2] * k]));
};

/** Hue angle in OKLab. Two candidates are the same *choice* when they point
    the same way, however pale either happens to be in the photograph. */
const hueOf = ([, a, b]: Lab): number => Math.atan2(b, a);

function hueApart(x: Lab, y: Lab): number {
  let d = Math.abs(hueOf(x) - hueOf(y));
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

const NEUTRAL: ToneCandidate = { id: "neutral", spill: CORPUS_SPILL, swatch: "#6d6760" };

/**
 * Five questions asked of one photograph:
 *
 * `light`    — the heaviest cluster among the brightest third of pixels.
 *              The site's own colour law applied to a single frame: chroma
 *              lives in the light, so this is usually the truest answer, and
 *              it is the default for that reason.
 * `dominant` — the heaviest cluster overall. What most of the frame is.
 * `vibrant`  — the cluster maximising chroma against √area, so a small
 *              saturated thing can win but one stray pixel cannot.
 * `counter`  — the dominant reflected through neutral. The ground already
 *              split-tones into a key and its reciprocal, so this swaps
 *              which of the two the photograph's own hue lands on.
 * `neutral`  — the corpus tone. No hue taken from this frame at all.
 */
export function readTones(source: CanvasImageSource, w: number, h: number): ToneCandidate[] {
  const S = 96;
  const k = Math.min(S / w, S / h, 1);
  const cw = Math.max(1, Math.round(w * k));
  const ch = Math.max(1, Math.round(h * k));

  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [NEUTRAL];
  ctx.drawImage(source, 0, 0, cw, ch);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, cw, ch).data;
  } catch {
    return [NEUTRAL]; // tainted canvas — shouldn't happen, same origin
  }

  const all = clusterLab(data);
  if (!all.length) return [NEUTRAL];

  const cut = lightnessCut(data, 0.67);
  const bright = clusterLab(data, { keep: (lab) => lab[0] >= cut });

  const dominant = all[0].lab;
  const light = (bright[0] ?? all[0]).lab;
  const vibrant = all.reduce((best, x) =>
    chromaOf(x.lab) * Math.sqrt(x.weight) > chromaOf(best.lab) * Math.sqrt(best.weight) ? x : best
  ).lab;
  const counter: Lab = [dominant[0], -dominant[1], -dominant[2]];

  const out: { id: ToneId; lab: Lab }[] = [
    { id: "light", lab: light },
    { id: "dominant", lab: dominant },
    { id: "vibrant", lab: vibrant },
    { id: "counter", lab: counter },
  ];

  // Drop a candidate only when it would light the room the same way as one
  // already offered — which is a question about hue, not about how pale the
  // raw pixel happened to be. A candidate with almost no chroma still has a
  // direction, and tone() will amplify it to the same level as any other.
  //
  // The threshold relaxes if it would leave too few choices: on a quiet frame
  // the four questions crowd together, and two chips is a thinner control
  // than the picture actually justifies. It never relaxes to zero — a frame
  // with genuinely one colour in it should say so rather than pad itself out.
  const usable = out.filter((o) => chromaOf(o.lab) > 1e-5);
  let kept: (ToneCandidate & { lab: Lab })[] = [];
  for (const sep of [0.32, 0.16, 0.07]) {
    kept = [];
    for (const { id, lab } of usable) {
      const dup = kept.some((prev) => hueApart(prev.lab, lab) < sep);
      if (!dup) kept.push({ id, spill: asSpill(lab), swatch: asSwatch(lab), lab });
    }
    if (kept.length >= 3) break;
  }

  return [...kept.map(({ lab: _lab, ...c }) => c), NEUTRAL];
}
