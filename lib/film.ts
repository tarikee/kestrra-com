/**
 * Render-time merge of the music videos (content/film.ts) with the pipeline
 * manifests (data/generated/*). Server-side only, as lib/work.ts.
 *
 * Each video's pool, `film-<slug>`, holds three stills, each followed by its
 * log view: `<id>`, `<id>-log`, … The first still is the lead.
 */
import "server-only";
import { FILMS, filmName, type FilmDef } from "@/content/film";
import type { WorkImage } from "./work";
import imagesJson from "@/data/generated/images.json";
import palettesJson from "@/data/generated/palettes.json";

type ManifestImage = Omit<WorkImage, "alt" | "base" | "n" | "beat" | "breathing">;

const manifests = imagesJson as unknown as Record<string, ManifestImage[]>;
const palettes = palettesJson as unknown as Record<string, { colors: string[]; spill: string }>;

/** what one still needs to be drawn: nothing more crosses to the client */
export type FilmFrame = Pick<
  WorkImage,
  "id" | "w" | "h" | "avif" | "webp" | "base" | "thumb" | "dominant" | "alt"
>;

/** one still from the published video, and the log view rebuilt from it */
export interface FilmStill {
  grade: FilmFrame;
  log: FilmFrame;
}

export interface Film {
  def: FilmDef;
  /** "Mahrina — Bubili" */
  name: string;
  /** the lead first */
  stills: FilmStill[];
  palette: string[];
  spill: string;
}

/** only the lead paints before it loads, so only the lead carries its thumbhash */
const frame = (pool: string, m: ManifestImage, alt: string, lead: boolean): FilmFrame => ({
  id: m.id,
  w: m.w,
  h: m.h,
  avif: m.avif,
  webp: m.webp,
  base: `/img/${pool}/${m.id}`,
  thumb: lead ? m.thumb : "",
  dominant: m.dominant,
  alt,
});

function resolve(def: FilmDef): Film {
  const pool = `film-${def.slug}`;
  const all = manifests[pool];
  if (!all) throw new Error(`manifest missing: ${pool} — run \`bun run assets\``);
  const name = filmName(def);
  const stills = all
    .filter((m) => !m.id.endsWith("-log"))
    .map((m, i): FilmStill => {
      const log = all.find((l) => l.id === `${m.id}-log`);
      if (!log) throw new Error(`log view missing: ${pool}/${m.id}-log`);
      return {
        grade: frame(pool, m, `Still from ${name}, as graded.`, i === 0),
        log: frame(pool, log, `Still from ${name}: a log view rebuilt from the graded frame.`, i === 0),
      };
    });
  const pal = palettes[pool] ?? { colors: [], spill: "#3a3f3d" };
  return { def, name, stills, palette: pal.colors, spill: pal.spill };
}

/** every video, in the order of content/film.ts */
export function getAllFilms(): Film[] {
  return FILMS.map(resolve);
}

/** "2023 – 2026" */
export function filmYears(films: Film[]): string {
  const ys = films.map((f) => Number(f.def.year)).filter(Boolean);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  return lo === hi ? String(lo) : `${lo} – ${hi}`;
}
