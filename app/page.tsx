import { Link } from "next-view-transitions";
import { getAllSets, corpusSpill } from "@/lib/work";
import { HeroIntro, type HeroTeaser } from "@/components/hero-intro";
import { IndexBlock } from "@/components/index-block";
import { LetterLight, MetaLight } from "@/components/letter-light";

export default function Home() {
  const sets = getAllSets();

  // the frames hanging around the mark — one from each of six bodies of
  // work, none of them index covers; each links into its set
  const teaserIds: [string, string][] = [
    ["engagement", "0021"],
    ["2hot4stage", "04530-edit"],
    ["cocktail-night", "00733"],
    ["riviera", "9493-2"],
    ["graduation", "09794"],
    ["zagreb", "0427"],
  ];
  const teasers: HeroTeaser[] = teaserIds.map(([slug, id]) => {
    const set = sets.find((s) => s.def.slug === slug)!;
    return {
      img: set.images.find((i) => i.id === id)!,
      title: set.def.title,
      href: `/work/${slug}`,
    };
  });

  return (
    <main>
      {/*
        Brute beauty and valour and act, oh, air, pride, plume, here
        Buckle! — G. M. Hopkins, "The Windhover", 1877
      */}
      {/* the hero belongs to no single set, so the room wears the colour of
          the whole body of work — every set's spill, averaged */}
      <HeroIntro teasers={teasers} spill={corpusSpill()} />

      <section id="work" className="relative mt-[6svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            Sets — commissioned and personal
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            2024 – 2026
          </p>
        </MetaLight>
        <div>
          {sets.map((s, i) => (
            <IndexBlock key={s.def.slug} set={s} index={i} />
          ))}
        </div>
      </section>

      <section
        id="practice"
        className="mx-[var(--margin)] mt-[22svh] grid gap-y-10 md:grid-cols-12 md:gap-x-[2.5vw]"
      >
        <MetaLight className="md:col-span-6">
          <h2 className="type-meta-sm text-low" data-lit>
            Practice
          </h2>
          <p className="type-lead mt-6 max-w-[54ch] text-hi">
            Kestrra photographs weddings, engagements, events, and campaigns
            across Europe — one day at a time, in its own colour. The grade is
            the signature: neutral rooms, honest light, colour that carries
            what the day actually felt like. Photo and video, shot and graded
            in-house.
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
              <dd data-lit>Europe</dd>
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
              <dd data-lit>DM, or the form below</dd>
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
              Planning a wedding, an event, a campaign?
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
