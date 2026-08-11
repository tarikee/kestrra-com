/**
 * Format-native set layout (DESIGN.md §8).
 *
 * The site adapts to the work, not the reverse. Rows are packed server-side
 * from each frame's true aspect ratio, so every image is shown at its own
 * proportions and every element has exact dimensions before paint — zero CLS.
 *
 * Two rules, both inherited from the work rather than invented:
 *  1. A frame wider than 2.2:1 takes the full width. The panorama earned it.
 *  2. Target row density comes from the set's own median aspect — portrait
 *     sets pack more per row, landscape sets fewer, so apparent frame size
 *     stays even across sets that shoot differently.
 */
import type { WorkImage } from "./work";

export interface LaidOutFrame {
  img: WorkImage;
  /** percentage of the row's content width */
  widthPct: number;
}

export interface LayoutRow {
  frames: LaidOutFrame[];
  /** row height as a fraction of content width — drives aspect-ratio box */
  heightRatio: number;
  full: boolean;
}

const PANORAMA = 2.2;

export function packRows(images: WorkImage[]): LayoutRow[] {
  if (images.length === 0) return [];
  const ar = (i: WorkImage) => i.w / i.h;

  const sorted = [...images].map(ar).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  // portrait-leaning sets (median < 1) want ~3 up; landscape ~2 up
  const targetSum = median < 1 ? median * 3.4 : median * 2.1;

  const rows: LayoutRow[] = [];
  let current: WorkImage[] = [];
  let sum = 0;

  const flush = (justify: boolean) => {
    if (current.length === 0) return;
    const total = current.reduce((s, i) => s + ar(i), 0);
    // an unjustified trailing row keeps the previous row's height rather than
    // stretching two frames across the full width
    const effective = justify ? total : Math.max(total, targetSum);
    rows.push({
      frames: current.map((img) => ({ img, widthPct: (ar(img) / effective) * 100 })),
      heightRatio: 1 / effective,
      full: false,
    });
    current = [];
    sum = 0;
  };

  for (const img of images) {
    if (ar(img) >= PANORAMA) {
      flush(true);
      rows.push({
        frames: [{ img, widthPct: 100 }],
        heightRatio: 1 / ar(img),
        full: true,
      });
      continue;
    }
    current.push(img);
    sum += ar(img);
    if (sum >= targetSum) flush(true);
  }
  flush(false);
  return rows;
}
