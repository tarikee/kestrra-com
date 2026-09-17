/**
 * Where everything sits, per composition, per ratio.
 *
 * A card is a photograph, a label and a mark on a ground. The three
 * compositions differ only in how much label there is and how much air the
 * picture gets; the five ratios differ in whether the label can live under
 * the photograph or has to move beside it. That is the whole table.
 *
 * Positions are computed from the bottom up — the mark is pinned to the
 * bottom margin, the label stacks above it, and the photograph takes every
 * pixel that is left. This is why a 16:9 card does not simply squash the
 * 9:16 one: the label moves to a column and the picture keeps its air.
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
  /** label column: first baseline, the baseline the block must END on
      (portrait only — the rig wraps upward from here so a long lens name can
      never grow down into the mark), and the width text may run to */
  label: { x: number; y: number; bottom: number; w: number; align: "left" | "right" };
  /** the mark, and the credit line under it */
  credit: { x: number; y: number; align: "left" | "right"; markH: number };
  /** type scale, derived from the card's short edge */
  t: { title: number; meta: number; small: number; lead: number };
  /** true when the label sits beside the photograph rather than under it */
  beside: boolean;
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
     be decorative rather than legible. The rig line is the widest thing here
     and sets the ceiling: 52 characters of Fragment Mono at this size just
     clears the margins in portrait. */
  const t = {
    title: Math.round(short * 0.048),
    lead: Math.round(short * 0.030),
    meta: Math.round(short * 0.026),
    small: Math.round(short * 0.022),
  };

  // the mark is a brush face with heavily overlapping letterforms; below
  // about 40px on a 1080 card it stops resolving as a word at all
  const markH = Math.round(short * 0.040);
  const gap = Math.round(short * 0.026);
  // a landscape card has no room to stack label under picture and still
  // leave the picture any air, so the label takes a column instead
  const beside = W / H > 1.15;

  if (beside) {
    const colW = Math.round(W * 0.26);
    const colX = W - pad;
    const photoW = W - pad * 2 - colW - gap * 2;
    return {
      W, H, pad, mat: Math.round(short * s.mat), t, beside,
      photo: { x: pad, y: pad, w: photoW, h: H - pad * 2 },
      label: { x: colX, y: pad + t.lead, bottom: pad + t.lead, w: colW, align: "right" },
      credit: { x: colX, y: H - pad, align: "right", markH },
    };
  }

  // portrait and square — the label stacks under the picture, the mark last
  const creditY = H - pad;
  const step = Math.round(t.meta * 1.62);
  // the rig can run to two lines once a lens name is in it, so the space is
  // reserved for the worst case rather than the common one
  const labelH = s.lines * step + (s.title ? t.title * 1.5 : 0);
  const labelBottom = creditY - markH - Math.round(markH * 0.85) - gap;
  const labelTop = labelBottom - labelH;
  const photoTop = pad;
  const photoBottom = labelTop - gap;

  return {
    W, H, pad, mat: Math.round(short * s.mat), t, beside,
    photo: { x: pad, y: photoTop, w: W - pad * 2, h: photoBottom - photoTop },
    label: { x: pad, y: labelTop + t.meta, bottom: labelBottom, w: W - pad * 2, align: "left" },
    credit: { x: pad, y: creditY, align: "left", markH },
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
