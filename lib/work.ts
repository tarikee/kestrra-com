/**
 * Render-time merge of the authored content model (content/sets.ts) with the
 * pipeline manifests (data/generated/*). Server-side only.
 */
import "server-only";
import { SETS, bySlug, type SetDef, type FrameDef } from "@/content/sets";
import imagesJson from "@/data/generated/images.json";
import palettesJson from "@/data/generated/palettes.json";

interface ManifestImage {
  id: string;
  w: number;
  h: number;
  avif: number[];
  webp: number[];
  thumbhash: string;
  thumb: string;
  dominant: string;
  exif: {
    camera?: string;
    lens?: string;
    focal?: number;
    aperture?: number;
    shutter?: string;
    iso?: number;
    date?: string;
  };
}

const manifests = imagesJson as unknown as Record<string, ManifestImage[]>;
const palettes = palettesJson as unknown as Record<string, { colors: string[]; spill: string }>;

export interface WorkImage extends ManifestImage {
  alt: string;
  beat?: string;
  breathing?: boolean;
  /** /img/<pool>/<id> */
  base: string;
  /** index within its set, 0-based */
  n: number;
}

export interface WorkSet {
  def: SetDef;
  images: WorkImage[];
  cover: WorkImage;
  satellites: WorkImage[];
  palette: string[];
  spill: string;
}

/**
 * The room's colour when no single set holds it — every set's spill averaged
 * in linear light. The hero wears it, and it is the tone baked into the still
 * ground (pipeline/render_ground.py, CORPUS_SPILL) and the shader's default.
 * If the corpus changes, that constant and the bake need re-running.
 */
export function corpusSpill(): string {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const srgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
  const pools = Object.values(palettes);
  const acc = [0, 0, 0];
  for (const p of pools) {
    const n = parseInt(p.spill.slice(1), 16);
    acc[0] += lin(((n >> 16) & 255) / 255);
    acc[1] += lin(((n >> 8) & 255) / 255);
    acc[2] += lin((n & 255) / 255);
  }
  return (
    "#" +
    acc
      .map((c) => Math.round(srgb(c / pools.length) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function resolveFrame(pool: string, f: FrameDef, n: number): WorkImage {
  const m = manifests[pool]?.find((i) => i.id === f.id);
  if (!m) throw new Error(`manifest missing: ${pool}/${f.id} — run \`bun run assets\``);
  return { ...m, alt: f.alt, beat: f.beat, breathing: f.breathing, base: `/img/${pool}/${f.id}`, n };
}

export function getSet(slug: string): WorkSet | null {
  const def = bySlug(slug);
  if (!def) return null;
  const images = def.frames.map((f, n) => resolveFrame(f.pool ?? def.pool, f, n));
  const find = (id: string) =>
    images.find((i) => i.id === id) ?? resolveFrame(def.pool, { id, alt: "" }, -1);
  // a merged set (frames from more than one pool) interleaves its pools'
  // palettes; the spill stays the primary pool's
  const pools = [...new Set([def.pool, ...def.frames.map((f) => f.pool ?? def.pool)])];
  const pal = palettes[def.pool] ?? { colors: [], spill: "#3a3f3d" };
  let colors = pal.colors;
  if (pools.length > 1) {
    const lists = pools.map((p) => palettes[p]?.colors ?? []);
    colors = Array.from({ length: pal.colors.length }, (_, i) => lists[i % lists.length][Math.floor(i / lists.length)]).filter(Boolean);
  }
  return {
    def,
    images,
    cover: find(def.cover),
    satellites: def.satellites.map(find),
    palette: colors,
    spill: def.spillOverride ?? pal.spill,
  };
}

export function getAllSets(): WorkSet[] {
  return SETS.map((s) => getSet(s.slug)!);
}

/** EXIF mono line: `Canon EOS M6 Mark II · 24mm · f/1.4 · 1/2000 · ISO 400` */
export function exifLine(img: WorkImage): string | null {
  const e = img.exif;
  if (!e) return null;
  const parts = [
    e.camera ?? null,
    e.lens ?? null,
    e.focal ? `${e.focal}mm` : null,
    e.aperture ? `f/${e.aperture}` : null,
    e.shutter ?? null,
    e.iso ? `ISO ${e.iso}` : null,
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(" · ") : null;
}
