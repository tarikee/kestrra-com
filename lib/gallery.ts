/**
 * The wall — every shipped frame, ordered by light (DESIGN.md §8c).
 *
 * Server-side and fully deterministic: the whole composition falls out of one
 * measured number per frame, so the page is static, the boxes are exact before
 * paint, and nothing is nudged by hand.
 *
 * Two passes:
 *   1. collect  every frame in content/sets.ts, plus content/gallery.ts's
 *               loose frames, joined to data/generated/luminance.json and
 *               sorted on its exposure key. Frames with no measured light —
 *               a manifest entry whose derivatives were never encoded — are
 *               dropped rather than guessed at.
 *   2. breathe   pack them into justified rows whose density, gutter and
 *               measure all move with position along the ramp: tall and
 *               sparse at the two ends, tight through the mid-key middle.
 */
import "server-only";
import { SETS } from "@/content/sets";
import { LOOSE } from "@/content/gallery";
import { getSet, type WorkImage } from "./work";
import lumJson from "@/data/generated/luminance.json";
import imagesJson from "@/data/generated/images.json";

const light = lumJson as unknown as Record<
  string,
  { lum: number; hi: number; spread: number; key: number }
>;
/** a loose frame is in the manifest but in no set, so getSet cannot reach it */
const manifests = imagesJson as unknown as Record<
  string,
  Omit<WorkImage, "alt" | "beat" | "breathing" | "base" | "n">[]
>;

export interface WallFrame {
  img: WorkImage;
  /** set slug, or null for a loose frame */
  slug: string | null;
  /** what the reading slot shows: set title, or the loose frame's context */
  context: string;
  spill: string;
  /** measured exposure key, 0–1 */
  key: number;
  /** index in ramp order */
  n: number;
}

export interface LaidFrame {
  frame: WallFrame;
  /** share of the desktop row's measure */
  widthPct: number;
  /** share of its mobile sub-row, 0–1 */
  wm: number;
  /** how many frames share that sub-row */
  mn: number;
}

export interface WallRow {
  frames: LaidFrame[];
  /** row height as a fraction of the row's own measure */
  heightRatio: number;
  /** columns of twelve this row occupies */
  cols: number;
  /** which margin the row is pushed against */
  align: "left" | "right";
  /** gutter for this row, in vw */
  gapVw: number;
  /** a single frame holding the row — a panorama, or the last frame standing */
  solo: boolean;
  /** the mobile gutter for this row, in rem */
  mGapRem: number;
  /** the row's height on a phone, in vw, excluding gutters — the
      content-visibility estimate, which the desktop measure gets wrong by
      several times over */
  mHeightVw: number;
  /** how many sub-rows it wraps into there */
  mSubRows: number;
  /** mean ramp position of the row, 0–1 — drives nothing else, but it is
      what the exposure rail reports and it is worth being able to read */
  t: number;
}

export interface Wall {
  rows: WallRow[];
  frames: WallFrame[];
  /** the measured ends of the ramp, for the rail's labels */
  darkest: number;
  brightest: number;
}

const PANORAMA = 2.2;

/** every frame that ships, in ramp order */
export function collect(): WallFrame[] {
  const out: Omit<WallFrame, "n">[] = [];
  const seen = new Set<string>();

  for (const def of SETS) {
    const set = getSet(def.slug);
    if (!set) continue;
    for (const img of set.images) {
      const pool = img.base.split("/")[2];
      const k = `${pool}/${img.id}`;
      if (seen.has(k)) continue; // Portraits merges two pools; a frame is one frame
      const l = light[k];
      if (!l) continue; // not encoded — nothing to show and nothing to measure
      seen.add(k);
      out.push({ img, slug: def.slug, context: def.title, spill: set.spill, key: l.key });
    }
  }

  for (const loose of LOOSE) {
    const k = `${loose.pool}/${loose.id}`;
    if (seen.has(k) || !light[k]) continue;
    const manifest = manifests[loose.pool]?.find((i) => i.id === loose.id);
    if (!manifest) continue;
    // a loose frame borrows its pool's world for the room's colour
    const host = SETS.find((s) => s.pool === loose.pool);
    const set = host ? getSet(host.slug) : null;
    seen.add(k);
    out.push({
      img: { ...manifest, alt: loose.alt, base: `/img/${loose.pool}/${loose.id}`, n: -1 },
      slug: null,
      context: loose.context,
      spill: set?.spill ?? "#3a3f3d",
      key: light[k].key,
    });
  }

  return out
    .sort((a, b) => a.key - b.key)
    .map((f, n) => ({ ...f, n }));
}

/**
 * The breathing pack.
 *
 * `sin(pi * t)` is the density curve — zero at both ends of the ramp, one in
 * the middle. Everything else is read off it:
 *
 *   target  the sum of aspect ratios a row wants before it flushes. Low at
 *           the ends (two or three frames, tall) and high in the middle
 *           (four or five, short).
 *   cols    the row's measure, in twelfths. Nine at the ends, twelve in the
 *           middle, so the wall's edge steps in and out on the grid instead
 *           of running as one hard rectangle.
 *   gap     widest where the wall is sparsest.
 *
 * Rows alternate which margin they are pushed against, so a narrow row never
 * sits directly under another narrow row on the same side.
 */
export function buildWall(frames: WallFrame[]): Wall {
  const rows: WallRow[] = [];
  if (!frames.length) return { rows, frames, darkest: 0, brightest: 0 };

  const ar = (f: WallFrame) => f.img.w / f.img.h;
  const n = frames.length;

  let current: WallFrame[] = [];
  let sum = 0;
  let narrowCount = 0;

  const flush = (justify: boolean) => {
    if (!current.length) return;

    // A row that flushes early — cut short by a panorama, or simply the end
    // of the archive — can be left holding one frame, and one frame justified
    // into a nine-column measure is either a stranded thumbnail or an
    // accidental hero. Neither is a composition. Give it back to the row
    // above instead; that row simply runs one frame denser.
    if (!justify && current.length === 1 && rows.length) {
      const last = rows[rows.length - 1];
      if (!last.solo && last.frames.length < 8) {
        const merged = [...last.frames.map((f) => f.frame), ...current];
        const total = merged.reduce((s, f) => s + ar(f), 0);
        last.frames = merged.map((frame) => ({
          frame,
          widthPct: (ar(frame) / total) * 100,
          wm: 0,
          mn: 1,
        }));
        last.heightRatio = 1 / total;
        current = [];
        sum = 0;
        return;
      }
    }

    const t = current.reduce((s, f) => s + f.n, 0) / current.length / (n - 1);
    const d = Math.sin(Math.PI * t); // 0 at the ends, 1 in the middle
    const cols = Math.round(9 + 3 * d);
    const gapVw = Math.round((0.35 + (1 - d) * 1.5) * 100) / 100;

    const total = current.reduce((s, f) => s + ar(f), 0);
    const effective = justify ? total : Math.max(total, target(d));
    // a nine-column row is pushed against alternating margins; a full-measure
    // row has no side to take
    const align: "left" | "right" = cols >= 12 ? "left" : narrowCount % 2 ? "right" : "left";
    if (cols < 12) narrowCount++;

    rows.push({
      frames: current.map((frame) => ({
        frame,
        widthPct: (ar(frame) / effective) * 100,
        wm: 0,
        mn: 1,
      })),
      heightRatio: 1 / effective,
      cols,
      align,
      gapVw,
      solo: current.length === 1,
      mGapRem: 0,
      mHeightVw: 0,
      mSubRows: 1,
      t: Math.round(t * 1000) / 1000,
    });
    current = [];
    sum = 0;
  };

  for (const f of frames) {
    const t = f.n / (n - 1);
    const d = Math.sin(Math.PI * t);

    // the panorama takes its row alone — it earned that on the set pages and
    // it earns it here (§8, rule 1). The row it interrupts is flushed
    // *unjustified*: stretching two frames across the full measure to make
    // way for a panorama is how you get a row four times the height of its
    // neighbours, which is exactly what it looked like the first time.
    if (ar(f) >= PANORAMA) {
      flush(false);
      current = [f];
      sum = ar(f);
      flush(true);
      continue;
    }

    current.push(f);
    sum += ar(f);
    if (sum >= target(d)) flush(true);
  }
  flush(false);
  packMobile(rows);

  return {
    rows,
    frames,
    darkest: frames[0].key,
    brightest: frames[n - 1].key,
  };
}

/** two or three frames at the ends, four or five through the middle */
function target(density: number): number {
  return 2.7 + density * 3.6;
}

/**
 * The same wall, at 390px.
 *
 * A phone cannot hold a nine-of-twelve measure or a seven-frame row — the
 * first build's answer was to collapse everything to one column, which threw
 * the composition away entirely and left a camera roll thirty thousand pixels
 * long. The arc is the page, so the arc has to survive the phone.
 *
 * Each desktop row is sub-packed into mobile rows by the same density curve:
 * one frame at the two ends, where a photograph gets the full width and the
 * wall is slow; two through the middle; three at the very peak, where it
 * should read as a contact sheet. The gutter breathes with it. Every sub-row
 * is justified from its own frames' proportions, so it fills the measure
 * exactly and the next one wraps on its own.
 *
 * This runs over the finished rows rather than inside the pack, so the
 * desktop composition is never bent to suit the phone.
 */
function packMobile(rows: WallRow[]): void {
  for (const row of rows) {
    const d = Math.sin(Math.PI * row.t);
    const per = row.solo ? 1 : d < 0.45 ? 1 : d < 0.88 ? 2 : 3;
    row.mGapRem = Math.round((0.3 + (1 - d) * 0.55) * 100) / 100;

    let height = 0;
    let subRows = 0;
    for (let i = 0; i < row.frames.length; i += per) {
      const group = row.frames.slice(i, i + per);
      const sum = group.reduce((s, f) => s + f.frame.img.w / f.frame.img.h, 0);
      for (const f of group) {
        f.mn = group.length;
        // the 0.999 is the wrap's safety margin: widths that sum to exactly
        // the measure are one sub-pixel rounding away from wrapping wrong
        f.wm =
          Math.round((f.frame.img.w / f.frame.img.h / sum) * 0.999 * 10000) / 10000;
      }
      // MEASURE is the mobile content width in vw — the viewport less both
      // page margins, which on every phone width is close enough to 90
      height += MEASURE / sum;
      subRows++;
    }
    row.mHeightVw = Math.round(height * 10) / 10;
    row.mSubRows = subRows;
  }
}

/** the phone's content measure, in vw: 100 less the two page margins */
const MEASURE = 90;
