import type { MetadataRoute } from "next";
import { SETS } from "@/content/sets";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kestrra.com";
  return [
    { url: base, priority: 1 },
    { url: `${base}/work`, priority: 0.9 },
    { url: `${base}/dev`, priority: 0.9 },
    { url: `${base}/film`, priority: 0.8 },
    { url: `${base}/inquiry`, priority: 0.9 },
    { url: `${base}/gallery`, priority: 0.6 },
    { url: `${base}/about`, priority: 0.6 },
    { url: `${base}/privacy`, priority: 0.3 },
    // sets only: a single frame's page is the set's photo again, so it stays
    // out of the index (see robots on /work/[set]/[piece])
    ...SETS.map((s) => ({ url: `${base}/work/${s.slug}`, priority: 0.8 })),
  ];
}
