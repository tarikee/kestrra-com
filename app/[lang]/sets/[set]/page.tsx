import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { POSTERS, SETS, bySlug } from "@/content/sets";
import { getSet, type WorkImage } from "@/lib/work";
import { JsonLd, setJsonLd, setTitle, UNLISTED } from "@/lib/seo";
import { packRows } from "@/lib/layout";
import { Pic } from "@/components/pic";
import { BackLink } from "@/components/back-link";
import { PaletteStrip } from "@/components/palette-strip";
import { ClientCredit } from "@/components/client-credit";
import { Sequence } from "@/components/sequence";
import { RestoreFocus } from "@/components/restore-focus";
import { mainFrame } from "@/components/index-block";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { SheetLight } from "@/components/sheet-light";
import { DotList } from "@/components/dot-list";
import { PointerField } from "@/components/pointer-field";
import { InquiryCta } from "@/components/inquiry-cta";
import { dict } from "@/dictionaries";
import { alternates, fmt, isLang, path, plural, type Lang } from "@/lib/i18n";

// unknown names render the styled 404 on demand instead of the bare default one
export const dynamicParams = true;

export function generateStaticParams() {
  return SETS.map((s) => ({ set: s.slug }));
}

// what a search for this set would call it — the blurb alone reads as a caption
function kindOfShoot(def: { slug: string; discipline: string }, lang: Lang): string {
  const t = dict(lang).set;
  // the discipline is looked up by its English word, which is the same on the
  // def whatever the page language
  const en = bySlug(def.slug)?.discipline ?? def.discipline;
  const known = (t.shoot as Record<string, string>)[en];
  return known ?? fmt(t.shootOther, { d: `${en[0].toUpperCase()}${en.slice(1)}` });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; set: string }>;
}): Promise<Metadata> {
  const { lang, set: slug } = await params;
  if (!isLang(lang)) return {};
  const set = getSet(slug, lang);
  if (!set) return {};
  const t = dict(lang).set;
  const cover = set.cover;
  return {
    title:
      lang === "sr"
        ? fmt(t.metaTitle, { title: set.def.title, kind: kindOfShoot(set.def, lang) })
        : setTitle(set.def, kindOfShoot(set.def, lang)),
    description: `${set.def.blurb} ${fmt(t.shotBy, { when: set.def.when })}`,
    alternates: alternates(`/sets/${set.def.slug}`, lang),
    ...(UNLISTED.has(set.def.slug) ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      locale: lang === "sr" ? "sr_RS" : "en_US",
      images: [
        {
          url: `${cover.base}/w1920.webp`,
          width: 1920,
          height: Math.round((1920 * cover.h) / cover.w),
          alt: cover.alt,
        },
      ],
    },
  };
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ lang: string; set: string }>;
}) {
  const { lang: l, set: slug } = await params;
  const lang = l as Lang;
  const t = dict(lang).set;
  const set = getSet(slug, lang);
  if (!set) notFound();

  const { def, images, palette, spill } = set;

  if (def.mode === "sequence") {
    return (
      <>
        {!UNLISTED.has(def.slug) && <JsonLd data={setJsonLd(set, lang)} />}
        <Sequence set={set} />
      </>
    );
  }

  // a poster leaves the grid for a spread of its own, beside its frame
  const poster = images.find((i) => POSTERS[i.id]);
  const source = poster && images.find((i) => i.id === POSTERS[poster.id]);
  // the photo the set's row holds still on the home page and the index
  // opens the page too, so a click on it lands on the same picture
  const main = mainFrame(set);
  const rows = packRows([main, ...images.filter((i) => i.id !== main.id)].filter((i) => !POSTERS[i.id]));
  const at = SETS.findIndex((s) => s.slug === def.slug);
  const nextDef = SETS[at + 1];
  // gora-polaroids is a sequence, not part of any preview
  const next = nextDef && nextDef.slug !== "gora-polaroids" ? nextDef : null;

  return (
    <main data-spill={spill} className="pt-[max(5.75rem,12svh)] md:pt-[15svh]">
      {!UNLISTED.has(def.slug) && <JsonLd data={setJsonLd(set, lang)} />}
      <RestoreFocus setSlug={def.slug} />

      {/* the header leans with you, the two columns at their own rates — the
          same field the index blocks sit in, quieter because this page is for
          reading the work rather than being shown it */}
      <PointerField>
        <header className="mx-[var(--margin)] grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
          <MetaLight
            className="md:col-span-7"
            style={{
              transform: "translate3d(calc(var(--px, 0) * 6px), calc(var(--py, 0) * 4px), 0)",
            }}
          >
            <BackLink
              fallback={path(lang, "/sets")}
              label={t.allSets}
              className="dev-link t-color type-meta inline-block"
            />
            <p className="type-meta-sm mt-8 text-low" data-lit>
              {def.kind === "commissioned" ? t.commissioned : t.personal}
            </p>
            <LetterLight as="h1" className="type-d1 mt-4 text-hi">
              {def.title}
            </LetterLight>
            <p className="type-meta mt-6 text-value" data-lit>
              <DotList items={[def.discipline, def.when, def.place, plural(lang, images.length, t.frameForms)].filter(Boolean)} />
            </p>
          </MetaLight>
          <div
            className="md:col-span-4 md:col-start-9 md:self-end"
            style={{
              transform: "translate3d(calc(var(--px, 0) * -4px), calc(var(--py, 0) * -3px), 0)",
            }}
          >
            <p className="type-body max-w-[40ch] text-mid">{def.blurb}</p>
            {def.client && <ClientCredit credit={def.client} className="mt-7" lang={lang} />}
            <PaletteStrip colors={palette} className="mt-8" lang={lang} />
          </div>
        </header>
      </PointerField>

      {poster && source && <PosterSpread slug={def.slug} poster={poster} source={source} lang={lang} />}

      <SheetLight className="mt-[12svh] px-[var(--margin)]">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="flex gap-[clamp(0.5rem,1.1vw,1.25rem)] max-md:flex-col max-md:gap-3"
            style={{
              marginBottom: "clamp(0.5rem, 1.1vw, 1.25rem)",
              contentVisibility: ri > 1 ? "auto" : undefined,
              containIntrinsicSize: ri > 1 ? "auto 40vw" : undefined,
            }}
          >
            {row.frames.map(({ img, widthPct }) => (
              <Link
                key={img.id}
                href={path(lang, `/sets/${def.slug}/${img.id}`)}
                id={`frame-${img.id}`}
                data-frame={img.id}
                className="sheet-frame group relative block focus-visible:outline-offset-[6px] max-md:!w-full"
                style={{ width: `${widthPct}%` }}
              >
                <Pic
                  img={img}
                  sizes={`${Math.round(widthPct)}vw`}
                  priority={ri === 0}
                  imgClassName="h-auto w-full transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:brightness-110"
                  className="block"
                  vtName={`frame-${def.slug}-${img.id}`}
                />
                <span className="sr-only">{fmt(t.openFrame, { n: img.n + 1 })}</span>
              </Link>
            ))}
          </div>
        ))}
      </SheetLight>

      {set.def.kind === "commissioned" && (
        <InquiryCta lang={lang} question={t.ctaQuestion} href="/inquiry?for=photo" className="mt-[16svh]" />
      )}

      <MetaLight className="mx-[var(--margin)] mt-[14svh] border-t border-hairline pt-8">
        <nav className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          <Link href={path(lang, "/sets")} className="dev-link t-color type-meta -my-2 py-2" data-lit>
            {t.allSets}
          </Link>
          {next && (
            <Link href={path(lang, `/sets/${next.slug}`)} className="dev-link t-color type-meta -my-2 py-2" data-lit>
              {fmt(t.next, { title: lang === "sr" ? (getSet(next.slug, lang)?.def.title ?? next.title) : next.title })}
            </Link>
          )}
        </nav>
      </MetaLight>
    </main>
  );
}

const fit = (img: WorkImage, h: string) => `min(100%, calc(${h} * ${img.w} / ${img.h}))`;
const lift =
  "h-auto w-full transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:brightness-110";

/**
 * A poster I designed from a frame of the set, out of the grid and given its
 * own spread: the frame, an arrow, the poster large in printer's crop marks,
 * and one line on what it is. Each is whole at its own shape and opens its own
 * frame page; on a phone the poster comes first.
 */
function PosterSpread({ slug, poster, source, lang }: { slug: string; poster: WorkImage; source: WorkImage; lang: Lang }) {
  const t = dict(lang).set;
  // a landscape poster runs across two thirds, its line beneath it
  const wide = poster.w > poster.h;
  return (
    <SheetLight className="mx-[var(--margin)] mt-[12svh]">
      <section aria-label={t.poster} className="grid items-end gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <div className="max-md:order-2 md:col-span-3">
          <Link
            href={path(lang, `/sets/${slug}/${source.id}`)}
            className="sheet-frame poster-source group relative block focus-visible:outline-offset-[6px]"
            style={{ width: fit(source, "50svh") }}
          >
            <Pic img={source} sizes="(min-width: 768px) 22vw, 70vw" className="block" imgClassName={lift} />
            <span className="sr-only">{fmt(t.openSource, { n: source.n + 1 })}</span>
          </Link>
          <p className="type-meta-sm mt-3 text-low">{fmt(t.sourceCaption, { n: source.n + 1 })}</p>
        </div>
        <p aria-hidden="true" className="type-meta hidden self-center text-center !text-[1.75rem] leading-none text-mid md:col-span-1 md:block">
          →
        </p>
        <div className={`max-md:order-first ${wide ? "md:col-span-8" : "md:col-span-5"}`}>
          <Link
            href={path(lang, `/sets/${slug}/${poster.id}`)}
            className="sheet-frame is-poster group relative block focus-visible:outline-offset-[16px]"
            style={{ width: fit(poster, "78svh") }}
          >
            <Pic img={poster} sizes={wide ? "(min-width: 768px) 62vw, 100vw" : "(min-width: 768px) 40vw, 100vw"} className="block" imgClassName={lift} />
            <span className="sr-only">{t.openPoster}</span>
          </Link>
        </div>
        <div className={`max-md:order-1 ${wide ? "md:col-span-5 md:col-start-5" : "md:col-span-3"}`}>
          <p className="type-meta-sm text-low">{t.posterLabel}</p>
          <p className="type-body mt-3 max-w-[30ch] text-mid">
            {fmt(t.posterLine, { n: source.n + 1 })}
          </p>
          <p className="type-meta mt-4 text-value">
            {poster.w} × {poster.h}
          </p>
        </div>
      </section>
    </SheetLight>
  );
}
