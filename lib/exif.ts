/**
 * The one technical line, formatted.
 *
 * Lives apart from lib/work.ts because work.ts is `server-only` and the
 * sequence viewer — a client component — prints this line under its plate.
 * The data itself is already in the client bundle either way: it rides along
 * on every image in the set the viewer is handed.
 */

export interface ExifData {
  camera?: string;
  lens?: string;
  focal?: number;
  aperture?: number;
  shutter?: string;
  iso?: number;
  date?: string;
}

/**
 * `Canon EOS M6 Mark II · EF-M22mm f/2 STM · 22mm · f/2 · 1/2500 · ISO 100`
 *
 * `lens: false` drops the lens name, which on a prime restates the focal
 * length and aperture already in the line — the same two numbers three times.
 * The sequence label is a wall label, not a spec sheet, so it takes the short
 * form; the piece view keeps the full one.
 */
export function exifLine(img: { exif?: ExifData }, opts?: { lens?: boolean }): string | null {
  const e = img.exif;
  if (!e) return null;
  const parts = [
    e.camera ?? null,
    opts?.lens === false ? null : e.lens ?? null,
    e.focal ? `${e.focal}mm` : null,
    e.aperture ? `f/${e.aperture}` : null,
    e.shutter ?? null,
    e.iso ? `ISO ${e.iso}` : null,
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(" · ") : null;
}
