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
/** the names on the body, not the model codes in the file */
const CAMERAS: Record<string, string> = {
  "SONY ILCE-7M4": "Sony A7 IV",
  "SONY ILCE-7M3": "Sony A7 III",
};

export function cameraName(camera?: string): string | null {
  if (!camera) return null;
  return CAMERAS[camera] ?? camera;
}

/**
 * `24-70mm F2.8 DG DN II | Art 024` → `Sigma 24-70mm f/2.8 DG DN II Art`:
 * the maker in front, the aperture written the way the rest of the line
 * writes it, the line name kept and the catalogue year dropped.
 */
export function lensName(lens?: string): string | null {
  if (!lens) return null;
  let name = lens.replace(/\bF(\d+(?:\.\d+)?)/g, "f/$1").replace(/(\d)-(\d)/g, "$1–$2");
  const line = name.match(/\s*\|\s*(Art|Contemporary|Sports)\s+\d+$/);
  if (line) name = `Sigma ${name.slice(0, line.index).trim()} ${line[1]}`;
  else if (/^(EF|RF|EF-M|EF-S)/.test(name)) name = `Canon ${name.replace(/^(EF-M|EF-S|EF|RF)(?=\d)/, "$1 ")}`;
  else if (/^FE\s/.test(name)) name = `Sony ${name}`;
  return name;
}

/** the settings as label and value, in the order a photographer reads them */
export function exifSpec(img: { exif?: ExifData }): { label: string; value: string }[] {
  const e = img.exif;
  if (!e) return [];
  return [
    { label: "Camera", value: cameraName(e.camera) },
    { label: "Lens", value: lensName(e.lens) },
    { label: "Focal", value: e.focal ? `${e.focal}mm` : null },
    { label: "Aperture", value: e.aperture ? `f/${e.aperture}` : null },
    { label: "Shutter", value: e.shutter ?? null },
    { label: "ISO", value: e.iso ? String(e.iso) : null },
  ].filter((p): p is { label: string; value: string } => !!p.value);
}

export function exifLine(img: { exif?: ExifData }, opts?: { lens?: boolean }): string | null {
  const e = img.exif;
  if (!e) return null;
  const parts = [
    cameraName(e.camera),
    opts?.lens === false ? null : lensName(e.lens),
    e.focal ? `${e.focal}mm` : null,
    e.aperture ? `f/${e.aperture}` : null,
    e.shutter ?? null,
    e.iso ? `ISO ${e.iso}` : null,
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(" · ") : null;
}

/**
 * `2025-11-08T14:52:42.000Z` → `Nov 2025`.
 *
 * The share card printed the raw EXIF timestamp, which is a debug value, not
 * a date — and a second-precision one under a photograph reads as a leak.
 * The short form matches the authored `when` strings in content/sets.ts, so a
 * card and its set page say the date the same way. UTC deliberately: the
 * frame's stored instant is what it is, and re-reading it in the viewer's zone
 * could shift the month for a shoot near midnight.
 */
export function shootMonth(date?: string): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}
