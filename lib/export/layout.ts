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

export function layout(
  style: CardStyle,
  W: number,
  H: number,
  /** the photograph's own w/h, when it is known. The region is sized to the
      picture when it is, and to the card alone when it is not. */
  aspect?: number | null
): CardLayout {
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

  const cardIsLandscape = W / H > 1.15;

  const captionReserve =
    s.lines * step + (s.title ? Math.round(t.title * 1.35) + step : 0) + captionGap;

  /* Which of the two compositions the card uses is a question about the
   * *picture*, not about the card.
   *
   * A column beside the picture was chosen on the card's shape alone, on the
   * reasoning that a landscape card cannot stack a caption under a picture
   * and leave the picture any air. That holds for an upright or a 3:2, and it
   * is exactly wrong for a panorama: a 2.9:1 frame is short, so stacking
   * costs it almost no height and hands back the 23.5% of the width the
   * column was taking. Measured on a 16:9 card, that panorama held 24.9% of
   * the card beside a column and 50.2% stacked — twice the photograph, for
   * the same honesty about not cropping it.
   *
   * So both are costed and the one that gives the photograph more of the card
   * wins. No threshold to tune, and it cannot be wrong in the direction that
   * matters: whichever way the picture leans, it gets the larger frame.
   */
  const besideRegion = () => {
    const colW = Math.round(W * 0.235);
    const gutter = Math.round(short * 0.06);
    return { colW, gutter, w: W - pad * 2 - colW - gutter, h: H - pad * 2 };
  };
  const areaIn = (w: number, h: number, a: number) => {
    const k = Math.min(w / a, h);
    return a * k * k;
  };

  let beside = cardIsLandscape;
  if (cardIsLandscape && aspect && aspect > 0) {
    const b = besideRegion();
    const stackH = H - pad * 2 - markH - signatureAir - captionReserve;
    beside = areaIn(b.w, b.h, aspect) >= areaIn(W - pad * 2, stackH, aspect);
  }

  /* Instagram draws its own furniture over a story: the progress bars, the
     avatar and the close button along the top, the reply field and the share
     and more buttons along the bottom. Meta's own guidance for the format is
     to keep anything that matters out of roughly the top and bottom 250px of
     a 1080×1920 canvas — about 13% at each end — and the card was ignoring
     it. The photograph started 89px down and the signature sat 89px off the
     floor, which put the top of every frame under the progress bars and the
     handle under the reply bar.

     So a story-shaped card insets its *content* top and bottom without
     changing the canvas: the file is still a true 1080×1920 and the ground
     still fills it edge to edge — it is the picture, the caption and the
     signature that move inward. Only the story ratio is affected. 9:16 is
     1.778 and the next tallest the panel offers is 4:5 at 1.25, so the test
     has a wide berth on both sides, and a feed post keeps its full bleed.

     The two ends are not equal. Meta's 250 is one number for both, but the
     reply field, the share and the more button are all along the bottom while
     the top carries only progress bars and a name — and the bottom is where a
     phone also spends its home indicator. Sitting exactly on the 250 line
     cleared it by nothing; the first pass put the signature's underside at
     1670.0 and left it touching. So the bottom takes more than the top, and
     both sit inside the line rather than on it. */
  const story = !beside && H / W >= 1.6;
  const top = story ? Math.max(pad, Math.round(H * 0.14)) : pad;
  const creditY = H - (story ? Math.max(pad, Math.round(H * 0.16)) : pad);

  if (beside) {
    const { colW, gutter } = besideRegion();
    const padFloorL = Math.max(Math.round(pad * 0.52), Math.round(short * 0.03));
    // the same reclamation as below, on the one axis a column leaves free.
    // An upright in a 16:9 card is bound by height and was paying a full
    // margin top and bottom for width it could never reach — 22.8% of the
    // card. The width is spoken for by the column and does not move.
    const w0 = W - pad * 2 - colW - gutter;
    const h0 = H - pad * 2;
    const padY = aspect && aspect > 0 && aspect <= w0 / h0 ? padFloorL : pad;
    const photoW = W - pad * 2 - colW - gutter;
    return {
      W, H, pad, mat: Math.round(short * s.mat), t, beside,
      column: { w: colW, gutter },
      photo: { x: pad, y: padY, w: photoW, h: H - padY * 2 },
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

  // stacked — caption under the picture, signature on the floor. Reached by
  // every upright and square card, and by a landscape card whose photograph
  // is wide enough that stacking gives it more room than a column would.
  /* The margin is a minimum, not a frame.
   *
   * `contain` makes the picture meet its region on exactly one axis; whatever
   * is left on the other axis is dead ground. Holding both margins fixed
   * therefore charges every photograph for room it cannot use, and the bill
   * is worst where the picture and the card disagree most: measured across
   * five ratios and five source shapes, the photograph held between 11.7% and
   * 43.7% of the card, and a square card spent a quarter of its height on
   * type furniture while a story spent a seventh of its own.
   *
   * So the binding axis — the one actually limiting the picture — is allowed
   * to reclaim margin down to a floor, and the other keeps the nominal margin
   * it was never using anyway. A wider frame for a panorama, a higher ceiling
   * for an upright. The floor is what stops this becoming a bleed.
   *
   * A story's top inset is not margin and is never reclaimed: it is
   * Instagram's furniture, and `topFloor` holds it exactly where the safe
   * band put it. `creditY` never moves either, so the signature stays on its
   * line and the safe band below it is untouched.
   */
  const padFloor = Math.max(Math.round(pad * 0.52), Math.round(short * 0.03));
  const topFloor = story ? top : padFloor;
  // the caption-to-signature gap may close somewhat, never to the point where
  // the two read as one block — §the two gaps that do all the grouping
  const airFloor = Math.round(short * 0.062);

  let padX = pad;
  let photoTop = top;
  let air = signatureAir;

  if (aspect && aspect > 0) {
    const w0 = W - pad * 2;
    const h0 = creditY - markH - air - captionReserve - photoTop;
    if (h0 > 0 && aspect > w0 / h0) {
      padX = padFloor; // width binds — widen the frame
    } else {
      photoTop = topFloor; // height binds — raise the ceiling
      air = airFloor; //     and close some of the floor gap
    }
  }

  const photoBottom = creditY - markH - air - captionReserve;

  return {
    W, H, pad, mat: Math.round(short * s.mat), t, beside,
    column: null,
    photo: { x: padX, y: photoTop, w: W - padX * 2, h: photoBottom - photoTop },
    // centred on the photograph, not aligned to the card. The caption
    // describes the picture, so it is measured from the picture — and since
    // the photograph is centred, anchoring the caption to the card's margin
    // left it visibly adrift of the thing it was captioning.
    //
    // Its measure stays on the nominal margin even when the picture has
    // reclaimed past it: a line of mono running the full width of a panorama
    // is a worse line, and the signature below it keeps that same margin, so
    // the two agree with each other rather than with the frame.
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
