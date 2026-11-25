import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SETS } from "@/content/sets";
import { getSet, exifLine } from "@/lib/work";
import { exifSpec, shootMonth } from "@/lib/exif";
import { Pic } from "@/components/pic";
import { PieceNav } from "@/components/piece-nav";
import { FrameSteps, FrameTapZones } from "@/components/frame-steps";
import { Sequence } from "@/components/sequence";
import { FullViewButton } from "@/components/full-view";
import { dict } from "@/dictionaries";
import { alternates, fmt, isLang, path, type Lang } from "@/lib/i18n";
import { ShareButton } from "@/components/export/share-button";

// unknown names render the styled 404 on demand instead of the bare default one
export const dynamicParams = true;

export function generateStaticParams() {
  return SETS.flatMap((s) => s.frames.map((f) => ({ set: s.slug, piece: f.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; set: string; piece: string }>;
}): Promise<Metadata> {
  const { lang, set: slug, piece } = await params;
  if (!isLang(lang)) return {};
  const set = getSet(slug, lang);
  const img = set?.images.find((i) => i.id === piece);
  if (!set || !img) return {};
  return {
    title: `${set.def.title}, ${set.def.place ?? set.def.when}`,
    description: img.alt,
    alternates: alternates(`/sets/${set.def.slug}/${img.id}`, lang),
    robots: { index: false, follow: true },
    openGraph: {
      locale: lang === "sr" ? "sr_RS" : "en_US",
      images: [
        {
          url: `${img.base}/w1920.webp`,
          width: 1920,
          height: Math.round((1920 * img.h) / img.w),
          alt: img.alt,
        },
      ],
    },
  };
}

export default async function PiecePage({
  params,
}: {
  params: Promise<{ lang: string; set: string; piece: string }>;
}) {
  const { lang: l, set: slug, piece } = await params;
  const lang = l as Lang;
  const t = dict(lang).piece;
  const set = getSet(slug, lang);
  if (!set) notFound();
  const idx = set.images.findIndex((i) => i.id === piece);
  if (idx === -1) notFound();

  // deep link into a sequence lands inside the sequence, at that frame
  if (set.def.mode === "sequence") {
    return <Sequence set={set} initialId={piece} />;
  }

  const img = set.images[idx];
  const prev = set.images[idx - 1] ?? null;
  const next = set.images[idx + 1] ?? null;
  const spec = exifSpec(img);
  // the card takes the short form, as the wall and the sequence already do:
  // a zoom's full model name is half the line, and on a share card the
  // exposure is the part worth reading. The footer below keeps the full line.
  const cardRig = exifLine(img, { lens: false });

  return (
    <main data-spill={set.spill} className="flex min-h-svh flex-col pt-[max(5.75rem,11svh)] [--piece-h:78svh] md:pt-[max(5.75rem,9svh)] md:[--piece-h:calc(100svh_-_max(5.75rem,9svh)_-_13rem)]">
      <PieceNav
        setSlug={set.def.slug}
        setTitle={set.def.title}
        currentId={img.id}
        prevId={prev?.id ?? null}
        nextId={next?.id ?? null}
        position={`${idx + 1} / ${set.images.length}`}
      />

      <h1 className="type-meta-sm mx-[var(--margin)] mt-4 font-normal text-mid">
        {fmt(t.heading, { title: set.def.title, n: idx + 1, total: set.images.length })}
      </h1>

      <FrameSteps setSlug={set.def.slug} prevId={prev?.id ?? null} nextId={next?.id ?? null}>
        {/* sized to the print, so the share control docks to the picture's own
            corner rather than to this centring box — which is the full width
            of the page and a void away from the frame. The width mirrors the
            one Pic derives from the same maxH; see .frame-dock. */}
        <div
          className="frame-dock min-w-0"
          style={{ ["--fit" as string]: `min(100%, calc(var(--piece-h) * ${img.w} / ${img.h}))` }}
        >
          <Pic
            img={img}
            sizes="(min-width: 768px) 88vw, 100vw"
            priority
            maxH="var(--piece-h)"
            className="block"
            vtName={`frame-${set.def.slug}-${img.id}`}
          />
          <FrameTapZones setSlug={set.def.slug} prevId={prev?.id ?? null} nextId={next?.id ?? null} />
          <FullViewButton
            setSlug={set.def.slug}
            index={idx}
            frames={set.images.map((i) => ({ id: i.id, base: i.base, w: i.w, h: i.h, alt: i.alt }))}
          />
          <ShareButton
            frame={{
              id: img.id,
              base: img.base,
              w: img.w,
              h: img.h,
              alt: img.alt,
              rig: cardRig,
              context: set.def.title,
              position: `${idx + 1} / ${set.images.length}`,
              date: shootMonth(img.exif?.date, lang),
            }}
          />
        </div>
      </FrameSteps>

      {/* what the frame shows, in words, then the settings it was made at,
          each under its own label the way the rest of the site lists facts:
          on a phone the body and lens get a line each and the four exposure
          numbers share one; on a wide screen it all sits on one strip beside
          the words, so the picture can keep the height of the screen. */}
      <footer className="mx-[var(--margin)] grid gap-x-12 gap-y-5 border-t border-hairline py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:py-3">
        {img.alt && <p className="type-caption max-w-[52ch] text-mid">{img.alt}</p>}
        {spec.length > 0 && (
          <dl className="type-meta-sm grid grid-cols-4 gap-x-4 gap-y-3 md:flex md:flex-wrap md:justify-end md:gap-x-7">
            {spec.map(({ key, value }) => (
              <div key={key} className={`min-w-0 ${key === "camera" || key === "lens" ? "col-span-4" : ""}`}>
                <dt className="text-low">{t.spec[key]}</dt>
                <dd className="text-value">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </footer>

      {/* preload neighbors so adjacent navigation is instantaneous */}
      {[prev, next].map(
        (n) =>
          n && (
            <link
              key={n.id}
              rel="preload"
              as="image"
              href={`${n.base}/w1600.avif`}
              type="image/avif"
            />
          )
      )}
    </main>
  );
}
