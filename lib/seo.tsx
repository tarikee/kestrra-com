import type { WorkImage, WorkSet } from "@/lib/work";

export const SITE = "https://kestrra.com";

/**
 * Sets that open for anyone holding the link but are never offered to search
 * engines: left out of the sitemap, marked noindex, and given no image data.
 */
export const UNLISTED = new Set(["gora-polaroids"]);

/** the largest encoded webp up to 1920 wide, which every frame has one of */
export function imageFile(img: WorkImage): { url: string; w: number; h: number } {
  const fit = img.webp.filter((w) => w <= 1920);
  const w = fit.length ? Math.max(...fit) : Math.min(...img.webp);
  return { url: `${SITE}${img.base}/w${w}.webp`, w, h: Math.round((w * img.h) / img.w) };
}

const PERSON = { "@type": "Person", "@id": `${SITE}/#person`, name: "Tarik Ramadani" };

/**
 * What a search engine should know about a set page: where it sits in the
 * site (breadcrumbs) and, for every photo on it, who made it and where to ask
 * about using it. Single-photo pages stay out of the index, so the photos are
 * described here, on the page that ranks.
 */
export function setJsonLd(set: WorkSet) {
  const { def, images } = set;
  const url = `${SITE}/sets/${def.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Kestrra", item: SITE },
          { "@type": "ListItem", position: 2, name: "Sets", item: `${SITE}/sets` },
          { "@type": "ListItem", position: 3, name: def.title, item: url },
        ],
      },
      {
        "@type": "ImageGallery",
        "@id": `${url}#gallery`,
        url,
        name: def.title,
        description: def.blurb,
        author: PERSON,
        ...(def.place ? { locationCreated: { "@type": "Place", name: def.place } } : {}),
        image: images.map((img) => {
          const file = imageFile(img);
          return {
            "@type": "ImageObject",
            contentUrl: file.url,
            name: img.alt,
            width: file.w,
            height: file.h,
            creator: PERSON,
            creditText: "Tarik Ramadani · Kestrra",
            copyrightNotice: "© Tarik Ramadani",
            acquireLicensePage: `${SITE}/inquiry`,
          };
        }),
      },
    ],
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
