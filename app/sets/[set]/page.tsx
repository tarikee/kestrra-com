import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { POSTERS, SETS } from "@/content/sets";
import { getSet, type WorkImage } from "@/lib/work";
import { JsonLd, setJsonLd, setTitle, UNLISTED } from "@/lib/seo";
import { packRows } from "@/lib/layout";
import { Pic } from "@/components/pic";
import { BackLink } from "@/components/back-link";
import { PaletteStrip } from "@/components/palette-strip";
import { ClientCredit } from "@/components/client-credit";
import { Sequence } from "@/components/sequence";
import { RestoreFocus } from "@/components/restore-focus";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { SheetLight } from "@/components/sheet-light";
import { DotList } from "@/components/dot-list";
import { PointerField } from "@/components/pointer-field";

export const dynamicParams = false;

export function generateStaticParams() {
  return SETS.map((s) => ({ set: s.slug }));
}

// what a search for this set would call it — the blurb alone reads as a caption
const SHOOT: Record<string, string> = {
  engagement: "Engagement photography",
  clothing: "Clothing campaign photography",
  nightlife: "Bar and nightlife photography",
  graduation: "Graduation portraits",
  corporate: "Corporate event photography",
  portrait: "Portrait photography",
  travel: "Travel photography",
  documentary: "Documentary photography",
  street: "Street photography",
  event: "Event photography",
};

function kindOfShoot(def: { title: string; discipline: string }): string {
  if (/wedding/i.test(def.title)) return "Wedding photography";
  return SHOOT[def.discipline] ?? `${def.discipline[0].toUpperCase()}${def.discipline.slice(1)} photography`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ set: string }>;
}): Promise<Metadata> {
  const { set: slug } = await params;
  const set = getSet(slug);
  if (!set) return {};
  const cover = set.cover;
  return {
    title: setTitle(set.def, kindOfShoot(set.def)),
    description: `${set.def.blurb} See all ${set.def.frames.length} frames, shot by Tarik Ramadani in ${set.def.when}.`,
    alternates: { canonical: `/sets/${set.def.slug}` },
    ...(UNLISTED.has(set.def.slug) ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
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
  params: Promise<{ set: string }>;
}) {
  const { set: slug } = await params;
  const set = getSet(slug);
  if (!set) notFound();

  const { def, images, palette, spill } = set;

  if (def.mode === "sequence") {
    return (
      <>
        {!UNLISTED.has(def.slug) && <JsonLd data={setJsonLd(set)} />}
        <Sequence set={set} />
      </>
    );
  }

  // a poster leaves the grid for a spread of its own, beside its frame
  const poster = images.find((i) => POSTERS[i.id]);
  const source = poster && images.find((i) => i.id === POSTERS[poster.id]);
  const rows = packRows(images.filter((i) => !POSTERS[i.id]));
  const at = SETS.findIndex((s) => s.slug === def.slug);
  const nextDef = SETS[at + 1];
  // gora-polaroids is a sequence, not part of any preview
  const next = nextDef && nextDef.slug !== "gora-polaroids" ? nextDef : null;

  return (
    <main data-spill={spill} className="pt-[max(5.75rem,12svh)] md:pt-[15svh]">
      {!UNLISTED.has(def.slug) && <JsonLd data={setJsonLd(set)} />}
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
              fallback="/sets"
              label="← all sets"
              className="dev-link t-color type-meta inline-block"
            />
            <p className="type-meta-sm mt-8 text-low" data-lit>
              {def.kind === "commissioned" ? "Commissioned" : "Personal"}
            </p>
            <LetterLight as="h1" className="type-d1 mt-4 text-hi">
              {def.title}
            </LetterLight>
            <p className="type-meta mt-6 text-value" data-lit>
              <DotList items={[def.discipline, def.when, def.place, `${images.length} frames`].filter(Boolean)} />
            </p>
          </MetaLight>
          <div
            className="md:col-span-4 md:col-start-9 md:self-end"
            style={{
              transform: "translate3d(calc(var(--px, 0) * -4px), calc(var(--py, 0) * -3px), 0)",
            }}
          >
            <p className="type-body max-w-[40ch] text-mid">{def.blurb}</p>
            {def.client && <ClientCredit credit={def.client} className="mt-7" />}
            <PaletteStrip colors={palette} className="mt-8" />
          </div>
        </header>
      </PointerField>

      {poster && source && <PosterSpread slug={def.slug} poster={poster} source={source} />}

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
                href={`/sets/${def.slug}/${img.id}`}
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
                <span className="sr-only">Open frame {img.n + 1}</span>
              </Link>
            ))}
          </div>
        ))}
      </SheetLight>

      <MetaLight className="mx-[var(--margin)] mt-[14svh] border-t border-hairline pt-8">
        <nav className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          <Link href="/sets" className="dev-link t-color type-meta" data-lit>
            ← all sets
          </Link>
          {next && (
            <Link href={`/sets/${next.slug}`} className="dev-link t-color type-meta" data-lit>
              next: {next.title} →
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
function PosterSpread({ slug, poster, source }: { slug: string; poster: WorkImage; source: WorkImage }) {
  // a landscape poster runs across two thirds, its line beneath it
  const wide = poster.w > poster.h;
  return (
    <SheetLight className="mx-[var(--margin)] mt-[12svh]">
      <section aria-label="Poster" className="grid items-end gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <div className="max-md:order-2 md:col-span-3">
          <Link
            href={`/sets/${slug}/${source.id}`}
            className="sheet-frame poster-source group relative block focus-visible:outline-offset-[6px]"
            style={{ width: fit(source, "50svh") }}
          >
            <Pic img={source} sizes="(min-width: 768px) 22vw, 70vw" className="block" imgClassName={lift} />
            <span className="sr-only">Open frame {source.n + 1}, the frame the poster was made from</span>
          </Link>
          <p className="type-meta-sm mt-3 text-low">frame {source.n + 1}</p>
        </div>
        <p aria-hidden="true" className="type-meta hidden self-center text-center !text-[1.75rem] leading-none text-mid md:col-span-1 md:block">
          →
        </p>
        <div className={`max-md:order-first ${wide ? "md:col-span-8" : "md:col-span-5"}`}>
          <Link
            href={`/sets/${slug}/${poster.id}`}
            className="sheet-frame is-poster group relative block focus-visible:outline-offset-[16px]"
            style={{ width: fit(poster, "78svh") }}
          >
            <Pic img={poster} sizes={wide ? "(min-width: 768px) 62vw, 100vw" : "(min-width: 768px) 40vw, 100vw"} className="block" imgClassName={lift} />
            <span className="sr-only">Open the poster</span>
          </Link>
        </div>
        <div className={`max-md:order-1 ${wide ? "md:col-span-5 md:col-start-5" : "md:col-span-3"}`}>
          <p className="type-meta-sm text-low">poster</p>
          <p className="type-body mt-3 max-w-[30ch] text-mid">
            A poster design from frame {source.n + 1} in this set.
          </p>
          <p className="type-meta mt-4 text-value">
            {poster.w} × {poster.h}
          </p>
        </div>
      </section>
    </SheetLight>
  );
}
