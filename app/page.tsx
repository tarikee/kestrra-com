import { Link } from "next-view-transitions";
import { getAllSets } from "@/lib/work";
import { HeroIntro, type HeroTeaser } from "@/components/hero-intro";
import { IndexBlock } from "@/components/index-block";

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
      <HeroIntro teasers={teasers} />

      <section id="work" className="relative mt-[6svh]">
        <div className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low">Sets — commissioned and personal</h2>
          <p className="type-meta-sm text-low">2024 – 2026</p>
        </div>
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
        <div className="md:col-span-6">
          <h2 className="type-meta-sm text-low">Practice</h2>
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
        </div>
        <dl className="type-meta text-mid md:col-span-3 md:col-start-10">
          <div className="flex justify-between gap-6 border-b border-hairline py-3">
            <dt className="text-low">Based</dt>
            <dd>Europe</dd>
          </div>
          <div className="flex justify-between gap-6 border-b border-hairline py-3">
            <dt className="text-low">Instagram</dt>
            <dd>
              <a href="https://instagram.com/kestrra" rel="noopener" className="t-color hover:text-hi">
                @kestrra ↗
              </a>
            </dd>
          </div>
          <div className="flex justify-between gap-6 border-b border-hairline py-3">
            <dt className="text-low">Inquiries</dt>
            <dd>DM, or the form below</dd>
          </div>
        </dl>
      </section>

      <section className="mx-[var(--margin)] mt-[22svh]">
        <Link href="/inquiry" className="group block border-t border-hairline pt-10">
          <p className="type-meta-sm text-low">Inquiries</p>
          <p className="type-d1 mt-4 max-w-[16ch] text-hi">
            Planning a wedding, an event, a campaign?
          </p>
          <p className="type-meta mt-8 text-mid transition-colors duration-[var(--duration-fast)] group-hover:text-hi">
            start an inquiry →
          </p>
        </Link>
      </section>
    </main>
  );
}
