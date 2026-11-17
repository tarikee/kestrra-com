import { Link } from "next-view-transitions";
import type { Film } from "@/lib/film";
import type { WorkImage } from "@/lib/work";
import { Pic } from "./pic";
import { PaletteStrip } from "./palette-strip";
import { PointerField } from "./pointer-field";
import { LetterLight, MetaLight } from "./letter-light";
import { SetLight } from "./index-block";
import { Compare, CompareLabels, FilmPlayer, FilmScreen, PlayButton } from "./film-compare";

/**
 * One music video on /film, in the grammar of a set on the index (the
 * windhover block, components/index-block.tsx): the frame on one side, the
 * plate on the other, alternating; number, title, the lab slip, the color
 * bar; the video's own light behind it all. The row is not one link, as a
 * set's is: the compare, the stills and the play button each answer the
 * hand themselves.
 */

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** the lab slip: short facts on a line, long ones under their label */
function FilmSlip({ film }: { film: Film }) {
  const { def } = film;
  const rows: [string, string][] = [
    ["artist", def.artist],
    ...(def.feat ? ([["ft.", def.feat]] as [string, string][]) : []),
    ["channel", def.channel],
  ];
  return (
    <dl className="mt-6 border-t border-hairline">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-4 border-b border-hairline py-[0.4rem]"
        >
          <dt className="type-meta-sm shrink-0 text-low" data-lit>
            {k}
          </dt>
          <dd className="type-meta-sm min-w-0 text-right text-mid" data-lit>
            {v}
          </dd>
        </div>
      ))}
      <div className="border-b border-hairline py-[0.55rem]">
        <dt className="type-meta-sm text-low" data-lit>
          my role
        </dt>
        <dd className="type-body mt-1 text-hi">{def.role}</dd>
      </div>
      {def.credits && (
        <div className="border-b border-hairline py-[0.55rem]">
          <dt className="type-meta-sm text-low" data-lit>
            credits
          </dt>
          <dd className="type-body mt-1 text-mid">{def.credits}</dd>
        </div>
      )}
    </dl>
  );
}

/** number, a rule, and what it is */
function PlateHead({ nn }: { nn: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="type-meta-sm text-mid" data-lit>
        {nn}
      </span>
      <span className="plate-rule h-px flex-1 bg-hairline-strong" />
      <span className="type-meta-sm text-mid" data-lit>
        music video
      </span>
    </div>
  );
}

export function FilmRow({ film, index }: { film: Film; index: number }) {
  const { def, palette, spill } = film;
  const nn = String(index + 1).padStart(2, "0");
  const right = index % 2 === 0; // focal side alternates, as on the index

  return (
    <article
      id={def.slug}
      data-spill={spill}
      aria-labelledby={`film-${def.slug}`}
      className="group relative scroll-mt-16"
    >
      <FilmPlayer slug={def.slug}>
        <PointerField className="relative overflow-x-clip">
          <SetLight palette={palette} right={right} />

          <div className="relative z-10 md:flex md:items-center">
            <div className="grid w-full grid-cols-1 items-center gap-y-8 px-[var(--margin)] py-10 md:grid-cols-12 md:gap-x-[2.5vw] md:py-[5svh]">
              {/* the frame holds still while the plate leans: it is the
                  thing being dragged */}
              <div
                className={`relative z-10 min-w-0 md:col-span-8 ${
                  right ? "md:order-2 md:col-start-5" : "md:col-start-1"
                }`}
              >
                <FilmScreen
                  stills={film.stills}
                  name={film.name}
                  youtube={def.youtube}
                  sizes="(min-width: 768px) 64vw, calc(100vw - 2.5rem)"
                  priority={index === 0}
                />
              </div>

              <MetaLight
                className={`relative z-30 min-w-0 md:col-span-3 ${
                  right ? "md:order-1 md:col-start-1" : "md:col-start-10"
                }`}
                style={{
                  transform: "translate3d(calc(var(--px, 0) * 7px), calc(var(--py, 0) * 5px), 0)",
                }}
              >
                <PlateHead nn={nn} />
                <p className="type-lead mt-4 text-mid">{def.artist}</p>
                <LetterLight id={`film-${def.slug}`} className="type-d2 set-title mt-1 text-hi">
                  {def.title}
                </LetterLight>
                <FilmSlip film={film} />
                <PaletteStrip colors={palette} className="mt-7" />
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <PlayButton name={film.name} />
                  <a href={watchUrl(def.youtube)} rel="noopener" className="dev-link t-color type-meta" data-lit>
                    watch on YouTube ↗
                  </a>
                </div>
              </MetaLight>
            </div>
          </div>
        </PointerField>
      </FilmPlayer>
    </article>
  );
}

/** the home page's featured video: the compare, and a plate that opens its row */
export function FilmFeature({ film }: { film: Film }) {
  const { def, palette, spill } = film;
  return (
    <article data-spill={spill} aria-labelledby={`feature-${def.slug}`} className="group relative">
      <PointerField className="relative overflow-x-clip">
        <SetLight palette={palette} right={false} />
        <div className="relative z-10 grid grid-cols-1 items-center gap-y-8 px-[var(--margin)] py-10 md:grid-cols-12 md:gap-x-[2.5vw] md:py-[5svh]">
          <div className="min-w-0 md:col-span-8">
            <Compare
              still={film.stills[0]}
              name={film.name}
              sizes="(min-width: 768px) 64vw, calc(100vw - 2.5rem)"
              className="transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:[filter:drop-shadow(0_0_60px_rgb(255_255_255/0.10))]"
            />
            <CompareLabels className="mt-3" />
          </div>
          <MetaLight
            className="min-w-0 md:col-span-3 md:col-start-10"
            style={{ transform: "translate3d(calc(var(--px, 0) * 7px), calc(var(--py, 0) * 5px), 0)" }}
          >
            <PlateHead nn="01" />
            <p className="type-lead mt-4 text-mid">{def.artist}</p>
            <LetterLight as="h3" id={`feature-${def.slug}`} className="type-d2 set-title mt-1 text-hi">
              {def.title}
            </LetterLight>
            <FilmSlip film={film} />
            <PaletteStrip colors={palette} className="mt-7" />
            <Link
              href={`/film#${def.slug}`}
              className="type-meta-sm -mb-2 mt-7 flex items-center gap-2 py-2 text-low transition-colors duration-[var(--duration-fast)] hover:text-hi group-hover:text-hi"
              data-lit
            >
              open video
              <span className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:translate-x-1">
                →
              </span>
            </Link>
          </MetaLight>
        </div>
      </PointerField>
    </article>
  );
}

/** one of the other videos on the home page: the lead still, whole, and its name */
export function FilmCard({ film, index }: { film: Film; index: number }) {
  const { def } = film;
  const still = film.stills[0].grade;
  return (
    <Link
      href={`/film#${def.slug}`}
      className="group block min-w-0 focus-visible:outline-none"
      aria-label={`${film.name}: ${def.role}`}
    >
      <div className="film-zone">
        <div style={{ "--r": String(still.w / still.h) } as React.CSSProperties}>
          <Pic
            img={{ ...(still as WorkImage), alt: "" }}
            sizes="(min-width: 768px) 30vw, calc(100vw - 2.5rem)"
            placeholder="dominant"
            className="block h-full w-full transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:[filter:drop-shadow(0_0_40px_rgb(255_255_255/0.12))] group-focus-visible:[filter:drop-shadow(0_0_40px_rgb(255_255_255/0.12))]"
            imgClassName="block h-full w-full object-contain"
          />
        </div>
      </div>
      <MetaLight className="mt-6">
        <div className="flex items-center gap-3">
          <span className="type-meta-sm text-mid" data-lit>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="plate-rule h-px flex-1 bg-hairline-strong" />
        </div>
        <p className="type-body mt-4 text-mid">{def.artist}</p>
        <LetterLight as="h3" className="type-d3 set-title text-hi">
          {def.title}
        </LetterLight>
        <p className="type-meta-sm mt-3 text-low" data-lit>
          {def.role}
        </p>
      </MetaLight>
    </Link>
  );
}
