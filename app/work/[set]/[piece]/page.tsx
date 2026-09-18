import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SETS } from "@/content/sets";
import { getSet, exifLine } from "@/lib/work";
import { shootMonth } from "@/lib/exif";
import { Pic } from "@/components/pic";
import { PieceNav } from "@/components/piece-nav";
import { Sequence } from "@/components/sequence";
import { ShareButton } from "@/components/export/share-button";

export const dynamicParams = false;

export function generateStaticParams() {
  return SETS.flatMap((s) => s.frames.map((f) => ({ set: s.slug, piece: f.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ set: string; piece: string }>;
}): Promise<Metadata> {
  const { set: slug, piece } = await params;
  const set = getSet(slug);
  const img = set?.images.find((i) => i.id === piece);
  if (!set || !img) return {};
  return {
    title: `${set.def.title} — ${img.n + 1} of ${set.images.length}`,
    description: img.alt,
  };
}

export default async function PiecePage({
  params,
}: {
  params: Promise<{ set: string; piece: string }>;
}) {
  const { set: slug, piece } = await params;
  const set = getSet(slug);
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
  const exif = exifLine(img);
  // the card takes the short form, as the wall and the sequence already do:
  // a zoom's full model name is half the line, and on a share card the
  // exposure is the part worth reading. The footer below keeps the full line.
  const cardRig = exifLine(img, { lens: false });

  return (
    <main data-spill={set.spill} className="flex min-h-svh flex-col pt-[11svh]">
      <PieceNav
        setSlug={set.def.slug}
        setTitle={set.def.title}
        currentId={img.id}
        prevId={prev?.id ?? null}
        nextId={next?.id ?? null}
        position={`${String(idx + 1).padStart(2, "0")} / ${String(set.images.length).padStart(2, "0")}`}
      />

      <div className="flex flex-1 items-center justify-center px-[var(--margin)] py-6">
        {/* sized to the print, so the share control docks to the picture's own
            corner rather than to this centring box — which is the full width
            of the page and a void away from the frame. The width mirrors the
            one Pic derives from the same maxH; see .frame-dock. */}
        <div
          className="frame-dock"
          style={{ ["--fit" as string]: `min(100%, calc(69svh * ${img.w} / ${img.h}))` }}
        >
          <Pic
            img={img}
            sizes="(min-width: 768px) 88vw, 100vw"
            priority
            maxH="69svh"
            className="block"
            vtName={`frame-${set.def.slug}-${img.id}`}
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
              position: `${String(idx + 1).padStart(2, "0")} / ${String(set.images.length).padStart(2, "0")}`,
              date: shootMonth(img.exif?.date),
            }}
          />
        </div>
      </div>

      {/* the description stays on the image as alt text only — the frame
          speaks for itself; the rig is the one line worth printing, and it
          keeps its right edge. The share control used to take the left of
          this rule and read as footer chrome from there; it is on the picture
          now, so the footer is the one line it always wanted to be. */}
      <footer className="mx-[var(--margin)] flex items-baseline justify-end gap-8 border-t border-hairline py-6">
        {exif && <p className="type-meta text-low">{exif}</p>}
      </footer>

      {/* preload neighbours so adjacent navigation is instantaneous */}
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
