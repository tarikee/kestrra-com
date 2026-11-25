import { og } from "@/lib/og";
import type { Metadata } from "next";
import { dict } from "@/dictionaries";
import { alternates, fmt, isLang, type Lang } from "@/lib/i18n";
import { getSet } from "@/lib/work";
import { InquiryCta } from "@/components/inquiry-cta";
import { collect, buildWall } from "@/lib/gallery";
import { exifLine } from "@/lib/exif";
import { GalleryWall, type SlimFrame } from "@/components/gallery-wall";
import { Pic } from "@/components/pic";
import { LetterLight, MetaLight } from "@/components/letter-light";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.gallery;
  return {
    title: m.title,
    // every frame here is already on its set's page, which is the one to rank
    robots: { index: false, follow: true },
    description: m.description,
    alternates: alternates("/gallery", lang),
    openGraph: og(lang),
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: Lang };
  const t = dict(lang).gallery;
  const wall = buildWall(collect());
  // the wall is built from the English data; a set's frames take their
  // title and alt text in the page language here
  const sets = new Map<string, ReturnType<typeof getSet>>();
  const local = (slug: string | null) => {
    if (!slug || lang === "en") return null;
    if (!sets.has(slug)) sets.set(slug, getSet(slug, lang));
    return sets.get(slug) ?? null;
  };

  // what crosses to the client: no thumbhash, no srcset arrays, one
  // pre-formatted rig line. See the note in components/gallery-wall.tsx.
  const slim: SlimFrame[] = wall.frames.map((f) => ({
    base: f.img.base,
    w: f.img.w,
    h: f.img.h,
    alt: local(f.slug)?.images.find((i) => i.id === f.img.id)?.alt ?? f.img.alt,
    context: local(f.slug)?.def.title ?? f.context,
    slug: f.slug,
    spill: f.spill,
    rig: exifLine(f.img, { lens: false }),
  }));

  return (
    <main className="pt-[12svh] md:pt-[15svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          {t.kicker}
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          {t.h1}
        </LetterLight>
        {/* the ordering is the page, so it is the one thing worth saying */}
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {t.sub}
        </p>
      </MetaLight>

      <GalleryWall frames={slim}>
        {wall.rows.map((row, ri) => (
          <div
            key={ri}
            className={`wall-row ${row.align === "right" ? "ml-auto" : ""}`}
            style={{
              width: `${(row.cols / 12) * 100}%`,
              gap: `${row.gapVw}vw`,
              marginBottom: `${row.gapVw}vw`,
              ["--mgap" as string]: `${row.mGapRem}rem`,
              // the desktop estimate and the phone's are different by several
              // times over; a wrong one costs both layout shift and a
              // scrollHeight that is nonsense until everything has rendered
              ["--ih" as string]: `${Math.round(row.heightRatio * (row.cols / 12) * 90)}vw`,
              ["--mih" as string]: `calc(${row.mHeightVw}vw + ${row.mGapRem * (row.mSubRows - 1)}rem)`,
            }}
            data-cv={ri > 2 ? "" : undefined}
          >
            {row.frames.map(({ frame, widthPct, wm, mn }) => (
              <button
                key={frame.img.base}
                type="button"
                data-frame={frame.n}
                className="wall-frame"
                style={
                  {
                    width: `${widthPct}%`,
                    "--wm": wm,
                    "--mn": mn,
                  } as React.CSSProperties
                }
                aria-label={fmt(t.cell, { context: local(frame.slug)?.def.title ?? frame.context, alt: local(frame.slug)?.images.find((i) => i.id === frame.img.id)?.alt ?? frame.img.alt })}
              >
                <Pic
                  img={frame.img}
                  sizes={`${Math.max(6, Math.round((widthPct / 100) * (row.cols / 12) * 100))}vw`}
                  priority={ri === 0}
                  cap={1080}
                  placeholder={ri < 2 ? "thumbhash" : "dominant"}
                  imgClassName="block h-auto w-full"
                />
              </button>
            ))}
          </div>
        ))}
      </GalleryWall>

      <InquiryCta lang={lang} question={t.ctaQuestion} href="/inquiry?for=photo" />
    </main>
  );
}
