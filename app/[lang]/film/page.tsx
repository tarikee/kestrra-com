import { og } from "@/lib/og";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllFilms } from "@/lib/film";
import { FilmRow } from "@/components/film-row";
import { InquiryCta } from "@/components/inquiry-cta";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { dict } from "@/dictionaries";
import { alternates, isLang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.film;
  return {
    title: m.title,
    description: m.description,
    alternates: alternates("/film", lang),
    openGraph: og(lang),
  };
}

export default async function FilmPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang).film;
  const films = getAllFilms(lang);

  return (
    <main className="pt-[12svh] md:pt-[15svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          {t.eyebrow}
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          {t.h1}
        </LetterLight>
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {t.lead}
        </p>
        {t.intro && (
          <p className="type-body mt-8 max-w-[60ch] text-mid" data-selectable>
            {t.intro}
          </p>
        )}
      </MetaLight>

      <section id="film" aria-label={t.sectionAria} className="relative mt-[7svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            {t.sectionHead}
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            {t.selected}
          </p>
        </MetaLight>
        <div>
          {films.map((f, i) => (
            <FilmRow key={f.def.slug} film={f} index={i} lang={lang} />
          ))}
        </div>
      </section>

      <InquiryCta lang={lang} question={t.ctaQuestion} href="/inquiry?for=photo" />
    </main>
  );
}
