import type { MetadataRoute } from "next";
import { SETS } from "@/content/sets";
import lastmod from "@/data/generated/lastmod.json";
import { getSet } from "@/lib/work";
import { imageFile, UNLISTED } from "@/lib/seo";
import { path } from "@/lib/i18n";

const dated: Record<string, string> = lastmod;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kestrra.com";
  const url = (p: string) => `${base}${p === "/" ? "" : p}`;
  // one entry per language, both pointing at each other
  const page = (enPath: string, priority: number, images?: string[]) => {
    const languages = { en: url(enPath), sr: url(path("sr", enPath)) };
    return (["en", "sr"] as const).map((lang) => ({
      url: languages[lang],
      priority,
      ...(dated[enPath] ? { lastModified: dated[enPath] } : {}),
      ...(images ? { images } : {}),
      alternates: { languages },
    }));
  };
  return [
    ...page("/", 1),
    ...page("/sets", 0.9),
    ...page("/dev", 0.9),
    ...page("/film", 0.8),
    ...page("/inquiry", 0.9),
    ...page("/about", 0.6),
    ...page("/license", 0.3),
    // gallery and privacy are noindex: every gallery frame ranks on its set's
    // page, and privacy has nothing to rank for.
    // Sets only: a single frame's page is the set's photo again, so it stays
    // out of the index (see robots on /sets/[set]/[piece]). Each set lists
    // its photos, so image search finds them on the page that ranks. Unlisted
    // sets are left out altogether.
    ...SETS.filter((s) => !UNLISTED.has(s.slug)).flatMap((s) =>
      page(
        `/sets/${s.slug}`,
        0.8,
        (getSet(s.slug)?.images ?? []).map((img) => imageFile(img).url),
      ),
    ),
  ];
}
