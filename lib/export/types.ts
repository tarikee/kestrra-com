/**
 * The share card's shape. Four controls, no more — composition, ratio,
 * colour, credit. Deliberately not a photo editor: nothing here crops,
 * grades, filters or otherwise touches a pixel of the photograph.
 */

/** Three compositions. They differ only in how much label sits around the
    photograph — the picture is the same picture in all three. */
export type CardStyle = "plate" | "label" | "full";

export const CARD_STYLES: { id: CardStyle; name: string; note: string }[] = [
  { id: "plate", name: "plate", note: "the print on its mat" },
  { id: "label", name: "label", note: "with the wall label" },
  { id: "full", name: "full", note: "the frame, barely titled" },
];

export type RatioId = "9:16" | "4:5" | "1:1" | "4:3" | "16:9";

/** Output pixel sizes. 1080 on the short edge is Instagram's native ceiling;
    anything larger is re-compressed on upload, so it only costs bandwidth. */
export const RATIOS: { id: RatioId; w: number; h: number; note: string }[] = [
  { id: "9:16", w: 1080, h: 1920, note: "story" },
  { id: "4:5", w: 1080, h: 1350, note: "feed post" },
  { id: "1:1", w: 1080, h: 1080, note: "square" },
  { id: "4:3", w: 1440, h: 1080, note: "classic" },
  { id: "16:9", w: 1920, h: 1080, note: "landscape" },
];

/** What prints under the mark. */
export type CreditMode = "handle" | "site" | "both" | "mark";

export const CREDIT_MODES: { id: CreditMode; name: string; line: string | null }[] = [
  { id: "handle", name: "handle", line: "@kestrra" },
  { id: "site", name: "site", line: "kestrra.com" },
  { id: "both", name: "both", line: "@kestrra · kestrra.com" },
  { id: "mark", name: "mark only", line: null },
];

export function creditLine(mode: CreditMode): string | null {
  return CREDIT_MODES.find((c) => c.id === mode)?.line ?? null;
}

/** Everything the renderer needs that isn't the photograph itself. */
export interface CardSpec {
  style: CardStyle;
  ratio: RatioId;
  /** hex the ground is toned from, already through the colour handles */
  spill: string;
  credit: CreditMode;
  /** the one technical line — `Canon EOS M6 Mark II · 22mm · f/2 · …` */
  rig: string | null;
  /** set title, e.g. "Engagement" */
  context: string | null;
  /** `04 / 18` */
  position: string | null;
  /** year or season, printed on the label composition only */
  date: string | null;
}

/**
 * Colour is a handful of swatches read out of the photograph, never a hue
 * wheel. A spectrum would let you put a colour in the room that is nowhere
 * in the picture, which is exactly the thing DESIGN.md §6 forbids: the hue
 * only ever comes from the work.
 *
 * Each candidate is a different *question* asked of the same photo, not a
 * different blend of it — see lib/export/palette.ts.
 */
export type ToneId = "dominant" | "light" | "vibrant" | "counter" | "neutral";

export const TONE_NAMES: { id: ToneId; name: string; note: string }[] = [
  { id: "dominant", name: "dominant", note: "the colour most of the frame is" },
  { id: "light", name: "in the light", note: "the colour its highlights are" },
  { id: "vibrant", name: "vibrant", note: "its strongest colour, not its commonest" },
  { id: "counter", name: "counter", note: "the opposite side of that" },
  { id: "neutral", name: "neutral", note: "the room's own tone, no hue taken" },
];

/** One derived swatch: the hex that tones the ground, and the hex to paint
    in the picker (they differ — the picker shows the colour as read, the
    ground takes it as *light*). */
export interface ToneCandidate {
  id: ToneId;
  /** fed to tone() in lib/ground-shader.ts */
  spill: string;
  /** what the swatch looks like in the panel */
  swatch: string;
}
