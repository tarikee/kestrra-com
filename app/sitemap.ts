import type { MetadataRoute } from "next";
import { SETS } from "@/content/sets";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kestrra.com";
  return [
    { url: base, priority: 1 },
    { url: `${base}/inquiry`, priority: 0.9 },
    ...SETS.map((s) => ({ url: `${base}/work/${s.slug}`, priority: 0.8 })),
    ...SETS.flatMap((s) =>
      s.frames.map((f) => ({ url: `${base}/work/${s.slug}/${f.id}`, priority: 0.4 }))
    ),
  ];
}
