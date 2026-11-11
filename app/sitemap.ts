import type { MetadataRoute } from "next";
import { SETS } from "@/content/sets";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kestrra.com";
  return [
    { url: base, priority: 1 },
    { url: `${base}/work`, priority: 0.9 },
    { url: `${base}/dev`, priority: 0.9 },
    { url: `${base}/inquiry`, priority: 0.9 },
    { url: `${base}/gallery`, priority: 0.6 },
    { url: `${base}/privacy`, priority: 0.3 },
    ...SETS.map((s) => ({ url: `${base}/work/${s.slug}`, priority: 0.8 })),
    ...SETS.flatMap((s) =>
      s.frames.map((f) => ({ url: `${base}/work/${s.slug}/${f.id}`, priority: 0.4 }))
    ),
  ];
}
