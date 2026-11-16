import type { MetadataRoute } from "next";
import { SETS } from "@/content/sets";
import lastmod from "@/data/generated/lastmod.json";

const dated: Record<string, string> = lastmod;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kestrra.com";
  const page = (path: string, priority: number) => ({
    url: `${base}${path === "/" ? "" : path}`,
    priority,
    ...(dated[path] ? { lastModified: dated[path] } : {}),
  });
  return [
    page("/", 1),
    page("/work", 0.9),
    page("/dev", 0.9),
    page("/film", 0.8),
    page("/inquiry", 0.9),
    page("/about", 0.6),
    // gallery and privacy are noindex: every gallery frame ranks on its set's
    // page, and privacy has nothing to rank for.
    // Sets only: a single frame's page is the set's photo again, so it stays
    // out of the index (see robots on /work/[set]/[piece]).
    ...SETS.map((s) => page(`/work/${s.slug}`, 0.8)),
  ];
}
