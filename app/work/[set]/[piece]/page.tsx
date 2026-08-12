import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SETS } from "@/content/sets";
import { getSet, exifLine } from "@/lib/work";
import { Pic } from "@/components/pic";
import { PieceNav } from "@/components/piece-nav";
import { Sequence } from "@/components/sequence";

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
        <Pic
          img={img}
          sizes="(min-width: 768px) 88vw, 100vw"
          priority
          maxH="69svh"
          className="block"
          vtName={`frame-${set.def.slug}-${img.id}`}
        />
      </div>

      {/* the description stays on the image as alt text only — the frame
          speaks for itself; the rig is the one line worth printing */}
      {exif && (
        <footer className="mx-[var(--margin)] flex justify-end border-t border-hairline py-6">
          <p className="type-meta text-low">{exif}</p>
        </footer>
      )}

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
