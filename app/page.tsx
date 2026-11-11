import { Link } from "next-view-transitions";
import { getAllSets } from "@/lib/work";
import { HeroFrame } from "@/components/hero-frame";
import { heroSlides } from "@/components/hero-picks";
import { IndexBlock } from "@/components/index-block";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { flagshipProjects, shownProjects } from "@/components/dev-projects";
import { DevCard } from "@/components/dev-work";

/** the home page's selection: commissioned client work first, then personal
    sets. The full index lives on /work. */
const SELECTED = ["wedding-day", "urban-sport-fest", "students-walk", "wedding-night", "graduation", "2hot4stage"];

export default function Home() {
  const sets = getAllSets();
  // each keeps its number from the full index, so 06 here is 06 on /work
  const selected = SELECTED.map((slug) => {
    const index = sets.findIndex((s) => s.def.slug === slug);
    return { set: sets[index], index };
  }).filter(({ set }) => !!set);
  const flagships = flagshipProjects();

  return (
    <main>
      {/*
        Brute beauty and valour and act, oh, air, pride, plume, here
        Buckle! — G. M. Hopkins, "The Windhover", 1877
      */}
      {/* the hero shows one set at a time, so the room wears the colour of
          whichever frame is on screen */}
      <HeroFrame slides={heroSlides()} />

      <section id="work" className="relative mt-[6svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            Photo — selected sets
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            2024 – 2026
          </p>
        </MetaLight>
        <div>
          {selected.map(({ set, index }) => (
            <IndexBlock key={set.def.slug} set={set} index={index} />
          ))}
        </div>
        <MetaLight className="mx-[var(--margin)] mt-[6svh] flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-hairline pt-6">
          <Link href="/work" className="dev-link t-color type-meta" data-lit>
            all work →
          </Link>
          <p className="type-meta-sm text-low" data-lit>
            {sets.length} sets in the index
          </p>
        </MetaLight>
      </section>

      {flagships.length > 0 && (
        <section id="development" aria-labelledby="development-head" className="mx-[var(--margin)] mt-[22svh]">
          <MetaLight className="flex items-baseline justify-between border-b border-hairline pb-4">
            <h2 id="development-head" className="type-meta-sm text-low" data-lit>
              Development — websites, apps and tools
            </h2>
            <p className="type-meta-sm text-low" data-lit>
              {String(shownProjects().length).padStart(2, "0")} projects
            </p>
          </MetaLight>
          <div className="mt-14 grid grid-cols-1 gap-x-[2.5vw] gap-y-20 md:grid-cols-3">
            {flagships.map((p) => (
              <DevCard key={p.slug} p={p} />
            ))}
          </div>
          <MetaLight className="mt-16 border-t border-hairline pt-6">
            <Link href="/dev" className="dev-link t-color type-meta" data-lit>
              all development →
            </Link>
          </MetaLight>
        </section>
      )}

      <section
        id="practice"
        className="mx-[var(--margin)] mt-[22svh] grid gap-y-10 md:grid-cols-12 md:gap-x-[2.5vw]"
      >
        <MetaLight className="md:col-span-6">
          <h2 className="type-meta-sm text-low" data-lit>
            Practice
          </h2>
          <p className="type-lead mt-6 max-w-[54ch] text-hi">
            I&rsquo;m Tarik. I photograph, film, and build websites, apps and
            software in Belgrade, where I study computer science.
          </p>
          <p className="type-body mt-6 max-w-[54ch] text-mid">
            Named for the windhover — the kestrel that holds perfectly still
            in moving air. That is the job: stay still, let the day move.
          </p>
        </MetaLight>
        <MetaLight className="md:col-span-3 md:col-start-10">
          <dl className="type-meta text-mid">
            <div className="flex justify-between gap-6 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                Based
              </dt>
              <dd data-lit>Belgrade, Serbia · works across Europe</dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                Email
              </dt>
              <dd>
                <a
                  data-selectable
                  href="mailto:hello@kestrra.com"
                  className="t-color hover:text-hi"
                  data-lit
                >
                  hello@kestrra.com
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                Instagram
              </dt>
              <dd>
                <a
                  href="https://instagram.com/kestrra"
                  rel="noopener"
                  className="t-color hover:text-hi"
                  data-lit
                >
                  @kestrra ↗
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-hairline py-3">
              <dt className="text-low" data-lit>
                Inquiries
              </dt>
              <dd data-lit>DM, email, or the inquiry form</dd>
            </div>
          </dl>
        </MetaLight>
      </section>

      <section className="mx-[var(--margin)] mt-[22svh]">
        <Link href="/inquiry" className="group block border-t border-hairline pt-10">
          <MetaLight>
            <p className="type-meta-sm text-low" data-lit>
              Inquiries
            </p>
            <LetterLight as="p" className="type-d1 mt-4 max-w-[16ch] text-hi">
              An event, a drop, a site or an app?
            </LetterLight>
            <p
              className="type-meta mt-8 text-mid transition-colors duration-[var(--duration-fast)] group-hover:text-hi"
              data-lit
            >
              start an inquiry →
            </p>
          </MetaLight>
        </Link>
      </section>
    </main>
  );
}
