import type { Metadata } from "next";
import { getAllSets } from "@/lib/work";
import { IndexBlock } from "@/components/index-block";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Every Kestrra set in one index — engagements, events, campaigns, portraits and personal work, each in its own colour.",
};

export default function WorkPage() {
  const sets = getAllSets();

  return (
    <main className="pt-[18svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          Index
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Work
        </LetterLight>
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {sets.length} sets · commissioned and personal
        </p>
      </MetaLight>

      <section id="work" aria-label="Sets" className="relative mt-[10svh]">
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
    </main>
  );
}
