import { og } from "@/lib/og";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { dict } from "@/dictionaries";
import { alternates, isLang, path, type Lang } from "@/lib/i18n";
import { InquiryCta } from "@/components/inquiry-cta";
import { getAllSets } from "@/lib/work";
import { HeroFrame } from "@/components/hero-frame";
import { heroSlides } from "@/components/hero-picks";
import { IndexBlock } from "@/components/index-block";
import { MetaLight } from "@/components/letter-light";
import { flagshipProjects } from "@/components/dev-projects";
import { DevCard } from "@/components/dev-work";
import { SocialLink } from "@/components/social";
import { Clients } from "@/components/clients";
import { getAllFilms } from "@/lib/film";
import { FilmCard, FilmFeature } from "@/components/film-row";

/** the home page's selection: commissioned client work first, then personal
    sets. The full index lives on /sets. */
const SELECTED = ["urban-sport-fest", "dragons-mark", "graduation", "cocktail-night", "winter-case", "portraits"];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.home;
  return {
    // the layout supplies the site title and its template; the home page uses the layout's default
    title: { absolute: m.title },
    description: m.description,
    alternates: alternates("/", lang),
    openGraph: og(lang),
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: Lang };
  const home = dict(lang).home;
  const sets = getAllSets(lang);
  // each keeps its number from the full index, so 06 here is 06 on /sets
  const selected = SELECTED.map((slug) => {
    const index = sets.findIndex((s) => s.def.slug === slug);
    return { set: sets[index], index };
  }).filter(({ set }) => !!set);
  const flagships = flagshipProjects();
  const films = getAllFilms();
  const [featured, ...moreFilms] = films;

  return (
    <main>
      {/*
        Brute beauty and valour and act, oh, air, pride, plume, here
        Buckle! — G. M. Hopkins, "The Windhover", 1877
      */}
      {/* the hero shows one set at a time, so the room wears the color of
          whichever frame is on screen */}
      <HeroFrame slides={heroSlides(lang)} lang={lang} />

      <Clients className="relative mt-[6svh]" lang={lang} />

      {flagships.length > 0 && (
        <section id="development" aria-labelledby="development-head" className="mx-[var(--margin)]">
          <MetaLight className="flex items-baseline justify-between border-b border-hairline pb-4">
            <h2 id="development-head" className="type-meta-sm text-low" data-lit>
              {home.devHead}
            </h2>
            <p className="type-meta-sm text-low" data-lit>
              {home.selectedWork}
            </p>
          </MetaLight>
          <div className="mt-14 grid grid-cols-1 gap-x-[2.5vw] gap-y-20 md:grid-cols-3">
            {flagships.map((p) => (
              <DevCard key={p.slug} p={p} lang={lang} />
            ))}
          </div>
          <MetaLight className="mt-16 border-t border-hairline pt-6">
            <Link href={path(lang, "/dev")} className="dev-link t-color type-meta" data-lit>
              {home.allDev}
            </Link>
          </MetaLight>
        </section>
      )}

      <section id="work" className="relative mt-[22svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            {home.setsHead}
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            {home.years}
          </p>
        </MetaLight>
        <div>
          {selected.map(({ set, index }) => (
            <IndexBlock key={set.def.slug} set={set} index={index} lang={lang} />
          ))}
        </div>
        <MetaLight className="mx-[var(--margin)] mt-[6svh] flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-hairline pt-6">
          <Link href={path(lang, "/sets")} className="dev-link t-color type-meta" data-lit>
            {home.allSets}
          </Link>
        </MetaLight>
      </section>

      {featured && (
        <section id="film" aria-labelledby="film-head" className="relative mt-[22svh]">
          <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
            <h2 id="film-head" className="type-meta-sm text-low" data-lit>
              {home.filmHead}
            </h2>
            <p className="type-meta-sm text-low" data-lit>
              {home.selectedWork}
            </p>
          </MetaLight>
          <FilmFeature film={featured} lang={lang} />
          {moreFilms.length > 0 && (
            <ul className="mx-[var(--margin)] mt-10 grid grid-cols-1 gap-x-[2.5vw] gap-y-16 sm:grid-cols-2">
              {moreFilms.map((f, i) => (
                <li key={f.def.slug} className="min-w-0">
                  <FilmCard film={f} index={i + 1} lang={lang} />
                </li>
              ))}
            </ul>
          )}
          <MetaLight className="mx-[var(--margin)] mt-16 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-hairline pt-6">
            <Link href={path(lang, "/film")} className="dev-link t-color type-meta" data-lit>
              {home.allFilm}
            </Link>
          </MetaLight>
        </section>
      )}

      <section className="mx-[var(--margin)] mt-[22svh] grid gap-y-10 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:col-span-6">
          <h2 className="type-meta-sm text-low" data-lit>
            {home.about}
          </h2>
          <p className="type-lead mt-6 max-w-[54ch] text-hi">
            {home.aboutLead}
          </p>
          <p className="type-body mt-6 max-w-[54ch] text-mid">
            {home.aboutBody}
          </p>
          <Link href={path(lang, "/about")} className="dev-link t-color type-meta mt-8 inline-block" data-lit>
            {home.aboutLink}
          </Link>
        </MetaLight>
        <MetaLight className="md:col-span-3 md:col-start-10">
          <dl className="type-meta text-mid">
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                {home.based}
              </dt>
              <dd data-lit>{home.basedValue}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                {home.email}
              </dt>
              <dd>
                <a
                  data-selectable
                  href="mailto:hello@kestrra.com"
                  className="dev-link t-color"
                  data-lit
                >
                  hello@kestrra.com
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                {home.instagram}
              </dt>
              <dd>
                <SocialLink kind="instagram" withHandle className="t-color hover:text-hi" data-lit />
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                {home.inquiries}
              </dt>
              <dd data-lit>{home.inquiriesValue}</dd>
            </div>
          </dl>
        </MetaLight>
      </section>

      <InquiryCta lang={lang} question={home.ctaQuestion} href="/inquiry" />
    </main>
  );
}
