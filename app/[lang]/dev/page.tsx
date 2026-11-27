import { og } from "@/lib/og";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { dict } from "@/dictionaries";
import { alternates, isLang, path } from "@/lib/i18n";
import { CraftSwitch } from "@/components/craft-switch";
import { GlitchMark } from "@/components/hero-frame";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { PointerField } from "@/components/pointer-field";
import { shownProjects } from "@/components/dev-projects";
import { DevRow } from "@/components/dev-work";
import { InquiryCta } from "@/components/inquiry-cta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.dev;
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: alternates("/dev", lang),
    openGraph: og(lang),
  };
}

/** drops the "[Tarik: …]" notes still waiting for his answers, so an
    unanswered line never shows; a row left empty is hidden */
const tidy = (v: string) => v.replace(/\s*\[Tarik:[^\]]*\]/g, "").trim();
const tidyRows = (rows: string[][]) =>
  rows.map(([k, v]) => [k, tidy(v)]).filter(([, v]) => v !== "");

/** ruled label / value rows, the same as About's facts */
function Rows({ rows }: { rows: string[][] }) {
  return (
    <dl className="type-meta m-0 border-t border-hairline text-mid md:col-span-7 md:col-start-6">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1.5 border-b border-hairline py-3 md:flex-row md:items-baseline md:justify-between md:gap-6">
          <dt className="shrink-0 text-low md:w-[9.5rem]" data-lit>
            {k}
          </dt>
          <dd className="m-0 min-w-0 max-w-[44ch] text-value [text-wrap:pretty] md:text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function DevPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang).dev;
  const all = shownProjects(lang);
  const MAIN = ["apartment-renovation-nyc", "kestrra-com", "kestrra-frames"];
  const main = MAIN.map((slug) => all.find((p) => p.slug === slug)).filter((p) => !!p);
  const own = all.filter((p) => !MAIN.includes(p.slug));

  return (
    <main>
      {/* the same door as the home hero: the mark with its signal, the small
          type taking the light, the column leaning with the pointer */}
      <PointerField>
        <header
          data-spill="#5b544d"
          className="mx-[var(--margin)] flex min-h-[56svh] flex-col justify-end pt-[12svh] md:pt-[15svh]"
        >
          <MetaLight
            style={{ transform: "translate3d(calc(var(--px, 0) * 6px), calc(var(--py, 0) * 4px), 0)" }}
          >
            <CraftSwitch current="dev" className="mb-7" />
            <h1 className="m-0">
              <GlitchMark className="h-auto w-[min(72vw,30rem)] text-hi" decorative />
              <span className="sr-only">{t.h1Sr}</span>
            </h1>
            <p className="type-meta mt-6 text-mid" data-lit>
              {t.tags}
            </p>
            <p className="type-lead mt-4 max-w-[30ch] text-balance text-hi">
              {t.lead}
            </p>
            <p className="type-body mt-2 max-w-[48ch] text-mid">
              {t.body}
            </p>
            <p className="type-meta-sm mt-3 text-mid" data-lit>
              {t.leadDev}{" "}
              <a href="https://lenkailic-architecture.com/" target="_blank" rel="noopener noreferrer" className="dev-link t-color">
                Lenka Ilic Architecture ↗
              </a>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href={path(lang, "/inquiry")} className="btn">
                <span className="btn-label">{t.write}</span>
                <span className="btn-arrow" aria-hidden="true">
                  <span>→</span>
                </span>
              </Link>
              <a href="#projects" className="dev-link t-color type-meta" data-lit>
                {t.toProjects}
              </a>
            </div>
          </MetaLight>
        </header>
      </PointerField>

      <section id="projects" aria-labelledby="projects-head" className="mx-[var(--margin)] mt-[7svh] scroll-mt-24">
        <MetaLight className="flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 id="projects-head" className="type-meta-sm text-low" data-lit>
            {t.sectionHead}
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            {t.selected}
          </p>
        </MetaLight>
        <div className="mt-20 flex flex-col gap-[16svh]">
          {main.map((p, i) => (
            <DevRow key={p.slug} p={p} index={i} lang={lang} />
          ))}
        </div>
        <MetaLight className="mt-[16svh] flex items-baseline justify-between border-b border-hairline pb-4">
          <h3 className="type-meta-sm text-low" data-lit>
            {t.ownTools}
          </h3>
        </MetaLight>
        <div className="mt-20 flex flex-col gap-[16svh]">
          {own.map((p, i) => (
            <DevRow key={p.slug} p={p} index={main.length + i} lang={lang} />
          ))}
        </div>
      </section>

      {tidyRows(t.how.steps).length > 1 && (
      <section aria-labelledby="how-head" className="mx-[var(--margin)] mt-[16svh]">
        <MetaLight className="grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
          <h2 id="how-head" className="type-meta-sm border-b border-hairline pb-4 text-low md:col-span-12" data-lit>
            {t.how.head}
          </h2>
          <Rows rows={tidyRows(t.how.steps)} />
        </MetaLight>
      </section>
      )}

      <section aria-labelledby="care-head" className="mx-[var(--margin)] mt-[12svh]">
        <MetaLight className="grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
          <h2 id="care-head" className="type-meta-sm border-b border-hairline pb-4 text-low md:col-span-12" data-lit>
            {t.care.head}
          </h2>
          <p className="type-body max-w-[54ch] text-mid md:col-span-5">{tidy(t.care.note)}</p>
          <Rows rows={tidyRows(t.care.tiers).map(([k, v]) => [k, `${v} ${t.care.price}`])} />
        </MetaLight>
      </section>

      <section aria-labelledby="faq-head" className="mx-[var(--margin)] mt-[12svh]">
        <MetaLight>
          <h2 id="faq-head" className="type-meta-sm border-b border-hairline pb-4 text-low" data-lit>
            {t.faq.head}
          </h2>
          <div className="max-w-[64ch]">
            {tidyRows(t.faq.items).map(([q, a]) => (
              <div key={q} className="border-b border-hairline py-5">
                <h3 className="type-body m-0 text-hi">{q}</h3>
                <p className="type-body mt-2 text-mid [text-wrap:pretty]">{a}</p>
              </div>
            ))}
          </div>
        </MetaLight>
      </section>

      <InquiryCta lang={lang} question={t.ctaQuestion} href="/inquiry?for=web" />

    </main>
  );
}
