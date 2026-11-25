import { og } from "@/lib/og";
import type { Metadata } from "next";
import { dict } from "@/dictionaries";
import { alternates, isLang, type Lang } from "@/lib/i18n";
import { getAllSets } from "@/lib/work";
import { IndexBlock } from "@/components/index-block";
import { InquiryCta } from "@/components/inquiry-cta";
import { LetterLight, MetaLight } from "@/components/letter-light";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.sets;
  return {
    title: m.title,
    description: m.description,
    alternates: alternates("/sets", lang),
    openGraph: og(lang),
  };
}

export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: Lang };
  const t = dict(lang).sets;
  const all = getAllSets(lang);
  // Gora stands apart: out of the dated run, last, after a long pause
  const apart = all.find((s) => s.def.slug === "gora-polaroids");
  const sets = all.filter((s) => s !== apart);

  return (
    <main className="pt-[12svh] md:pt-[15svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          {t.kicker}
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          {t.h1}
        </LetterLight>
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {t.sub}
        </p>
      </MetaLight>

      <section id="work" aria-label={t.sectionLabel} className="relative mt-[7svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            {t.indexHead}
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            {t.years}
          </p>
        </MetaLight>
        <div>
          {sets.map((s, i) => (
            <IndexBlock key={s.def.slug} set={s} index={i} lang={lang} />
          ))}
        </div>
      </section>

      <InquiryCta lang={lang} question={t.ctaQuestion} href="/inquiry?for=photo" />

      {apart && (
        <section aria-label={apart.def.title} className="relative mt-[22svh] md:mt-[30svh]">
          <IndexBlock set={apart} index={sets.length} lang={lang} />
        </section>
      )}

    </main>
  );
}
