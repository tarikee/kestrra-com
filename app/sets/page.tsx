import type { Metadata } from "next";
import { getAllSets } from "@/lib/work";
import { IndexBlock } from "@/components/index-block";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Photo sets: events, portraits and campaigns",
  description:
    "Every Kestrra set in one index: engagements, events, campaigns, portraits and personal work, each in its own color.",
};

export default function WorkPage() {
  const all = getAllSets();
  // Gora stands apart: out of the dated run, last, after a long pause
  const apart = all.find((s) => s.def.slug === "gora-polaroids");
  const sets = all.filter((s) => s !== apart);

  return (
    <main className="pt-[12svh] md:pt-[15svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          Photo &amp; film
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Sets
        </LetterLight>
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {all.length} sets · commissioned and personal
        </p>
      </MetaLight>

      <section id="work" aria-label="Sets" className="relative mt-[7svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            Sets · commissioned and personal
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

      {apart && (
        <section aria-label={apart.def.title} className="relative mt-[22svh] md:mt-[30svh]">
          <IndexBlock set={apart} index={sets.length} />
        </section>
      )}
    </main>
  );
}
