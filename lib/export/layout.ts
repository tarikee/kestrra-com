/**
 * Where everything sits, per composition, per ratio.
 *
 * A card carries three things, and they are three *different* things:
 *
 *   the photograph   the subject
 *   the caption      what the picture is and what made it — this belongs to
 *                    the photograph
 *   the signature    the mark and the handle — this belongs to Kestrra
 *
 * The first version stacked caption and signature into one left-aligned run
 * at a uniform rhythm, and they read as a single block: the exposure settings
 * looked like part of the watermark, and the mark and the handle sat close
 * enough to be one lockup. Proximity is what groups things, so the fix is
 * spacing rather than decoration —
 *
 *   · the caption sits just under the photograph, near enough that it plainly
 *     belongs to it (0.028 of the short edge)
 *   · the signature is pinned to the bottom margin with three times that air
 *     above it, so it reads as a separate statement
 *   · the mark and the credit line share one baseline at opposite ends of the
 *     card instead of stacking a few points apart — the same
 *     `items-baseline justify-between` figure the site's own labels use
 *
 * Everything aligns to the card's content margin, which is the one stable
 * reference: the photograph is centred, so its own edge moves with its aspect
 * ratio and would drag the caption around with it.
 */
import type { CardStyle } from "./types";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CardLayout {
  /** the card, in pixels */
  W: number;
  H: number;
  /** outer margin */
  pad: number;
  /** the region the photograph is fitted inside, contain + centred */
  photo: Box;
  /** mat inset around the photograph — 0 means no mat is drawn */
  mat: number;
  /** the caption, which hangs off the photograph's own bottom edge */
  caption: {
    x: number;
    /** portrait: distance below the photo's bottom. beside: unused */
    gap: number;
    /** beside: an absolute first baseline. portrait: null, it follows the photo */
    top: number | null;
    w: number;
    step: number;
    align: "left" | "right" | "center";
    title: boolean;
  };
  /** the signature row — mark at one end, credit line at the other */
  credit: {
    /** baseline shared by the mark's bottom edge and the credit text */
    y: number;
    markH: number;
    left: number;
    right: number;
    /** a narrow column may not fit both on one line; the renderer measures */
    mayStack: boolean;
  };
  t: { title: number; meta: number; small: number; lead: number };
  /** true when the caption sits beside the photograph rather than under it */
  beside: boolean;
  /** landscape only: the text column's width and its gutter from the picture.
      Its x is not fixed here — the renderer centres picture + gutter + column
      as one group once the photograph's real width is known. */
  column: { w: number; gutter: number } | null;
}

const STYLE = {
  plate: { padF: 0.082, mat: 0.028, lines: 2, title: false },
  label: { padF: 0.075, mat: 0, lines: 4, title: true },
  full: { padF: 0.045, mat: 0, lines: 2, title: false },
} as const;

export function layout(style: CardStyle, W: number, H: number): CardLayout {
  const s = STYLE[style];
  const short = Math.min(W, H);
  const pad = Math.round(short * s.padF);

  /* Sized for the screen this is actually read on. A story fills a phone at
     roughly 400pt wide, so type on a 1080-wide card is seen at about a third
     of its pixel size — the site's own 13px metadata would land near 4pt and
     be decorative rather than legible. */
  const t = {
    title: Math.round(short * 0.048),
    lead: Math.round(short * 0.03),
    meta: Math.round(short * 0.026),
    small: Math.round(short * 0.022),
  };

  // the mark is a brush face with heavily overlapping letterforms; below
  // about 40px on a 1080 card it stops resolving as a word at all
  const markH = Math.round(short * 0.04);
  const step = Math.round(t.meta * 1.62);

  // the two gaps that do all the grouping. Their ratio is the whole point:
  // near the picture, far from the signature.
  const captionGap = Math.round(short * 0.038);
  const signatureAir = Math.round(short * 0.085);

  const beside = W / H > 1.15;
  const creditY = H - pad;

  if (beside) {
    // a landscape card cannot stack a caption under the picture and still
    // leave the picture any air, so the caption takes a column instead
    const colW = Math.round(W * 0.235);
    const gutter = Math.round(short * 0.06);
    const photoW = W - pad * 2 - colW - gutter;
    return {
      W, H, pad, mat: Math.round(short * s.mat), t, beside,
      column: { w: colW, gutter },
      photo: { x: pad, y: pad, w: photoW, h: H - pad * 2 },
      // x and the baselines are placeholders: drawCaption and drawCredit
      // recompute them against the photograph's own edges, because a portrait
      // frame in a 16:9 card uses barely a third of the width it is offered
      // and a column pinned to the card's margin would sit a void away from it
      caption: {
        x: pad, gap: 0, top: pad + t.lead, w: colW,
        step, align: "left", title: s.title,
      },
      credit: { y: creditY, markH, left: pad, right: pad + colW, mayStack: true },
    };
  }

  // portrait and square — caption under the picture, signature on the floor.
  // The photograph's region is whatever is left once both have their room.
  const captionReserve =
    s.lines * step + (s.title ? Math.round(t.title * 1.35) + step : 0) + captionGap;
  const photoBottom = creditY - markH - signatureAir - captionReserve;

  return {
    W, H, pad, mat: Math.round(short * s.mat), t, beside,
    column: null,
    photo: { x: pad, y: pad, w: W - pad * 2, h: photoBottom - pad },
    // centred on the photograph, not aligned to the card. The caption
    // describes the picture, so it is measured from the picture — and since
    // the photograph is centred, anchoring the caption to the card's margin
    // left it visibly adrift of the thing it was captioning.
    caption: {
      x: pad, gap: captionGap, top: null, w: W - pad * 2,
      step, align: "center", title: s.title,
    },
    credit: { y: creditY, markH, left: pad, right: W - pad, mayStack: false },
  };
}

/** Fit `src` inside `box`, preserving aspect, centred — the photograph is
    never cropped or stretched to fill a ratio. Letterbox is the honest
    answer; a crop would be an edit. */
export function contain(box: Box, sw: number, sh: number): Box {
  const k = Math.min(box.w / sw, box.h / sh);
  const w = sw * k;
  const h = sh * k;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}
