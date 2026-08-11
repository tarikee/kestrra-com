import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { SETS } from "@/content/sets";
import { getSet } from "@/lib/work";
import { packRows } from "@/lib/layout";
import { Pic } from "@/components/pic";
import { PaletteStrip } from "@/components/palette-strip";
import { ClientCredit } from "@/components/client-credit";
import { Sequence } from "@/components/sequence";
import { RestoreFocus } from "@/components/restore-focus";

export const dynamicParams = false;

export function generateStaticParams() {
  return SETS.map((s) => ({ set: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ set: string }>;
}): Promise<Metadata> {
  const { set: slug } = await params;
  const set = getSet(slug);
  if (!set) return {};
  return {
    title: set.def.title,
    description: set.def.blurb,
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
    return <Sequence set={set} />;
  }

  const rows = packRows(images);

  return (
    <main data-spill={spill} className="pt-[18svh]">
      <RestoreFocus setSlug={def.slug} />

      <header className="mx-[var(--margin)] grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <div className="md:col-span-7">
          <Link
            href="/#work"
            className="type-meta t-color inline-block text-mid hover:text-hi"
          >
            ← all sets
          </Link>
          <p className="type-meta-sm mt-8 text-low">
            {def.kind === "commissioned" ? "Commissioned" : "Personal"}
          </p>
          <h1 className="type-d1 mt-4 text-hi">{def.title}</h1>
          <p className="type-meta mt-6 text-mid">
            {[def.discipline, def.when, `${images.length} frames`].join(" · ")}
          </p>
        </div>
        <div className="md:col-span-4 md:col-start-9 md:self-end">
          <p className="type-body max-w-[40ch] text-mid">{def.blurb}</p>
          {def.client && <ClientCredit credit={def.client} className="mt-7" />}
          <PaletteStrip colors={palette} className="mt-8" />
        </div>
      </header>

      <div className="mt-[12svh] px-[var(--margin)]">
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
                href={`/work/${def.slug}/${img.id}`}
                id={`frame-${img.id}`}
                data-frame={img.id}
                className="group relative block focus-visible:outline-offset-[6px] max-md:!w-full"
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
      </div>

      <nav className="mx-[var(--margin)] mt-[14svh] border-t border-hairline pt-8">
        <Link href="/#work" className="type-meta t-color text-mid hover:text-hi">
          ← all sets
        </Link>
      </nav>
    </main>
  );
}
