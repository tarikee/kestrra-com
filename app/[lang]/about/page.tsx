import { og } from "@/lib/og";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { dict } from "@/dictionaries";
import { alternates, isLang, path, type Lang } from "@/lib/i18n";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { CLIENTS } from "@/content/clients";
import { PRESS } from "@/content/press";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.about;
  return {
    title: m.title,
    description: m.description,
    alternates: alternates("/about", lang),
    openGraph: og(lang),
  };
}

/** the facts, ruled like the home page's About rows */
function rows(lang: Lang): [string, React.ReactNode][] {
  const t = dict(lang).about.rows;
  return [
  [t.study, <span key="v" data-lit>{t.studyValue}</span>],
  [t.work, <span key="v" data-lit>{t.workPrefix} <a href="https://lenkailic-architecture.com/" target="_blank" rel="noopener noreferrer" className="dev-link t-color">Lenka Ilic Architecture ↗</a></span>],
  [t.based, <span key="v" data-lit>{t.basedValue}</span>],
  [t.languages, <span key="v" data-lit>{t.languagesValue}</span>],
  [
    t.press,
    <ul key="v" className="m-0 flex list-none flex-col items-end gap-1.5 p-0">
      {PRESS.map((p) => (
        <li key={p.href}>
          <a href={p.site} target="_blank" rel="noopener noreferrer" title={p.title} className="dev-link t-color" data-lit>
            {p.outlet} ↗
          </a>
        </li>
      ))}
    </ul>,
  ],
  ];
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang).about;
  return (
    <main className="pt-[12svh] md:pt-[15svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          {t.eyebrow}
        </p>
        {/* the studio is the heading; who is behind it is the line under it */}
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          {t.h1}
        </LetterLight>
        <p className="type-lead mt-6 max-w-[54ch] text-hi [text-wrap:pretty]" data-lit>
          {t.lead}
        </p>
        <p className="type-meta mt-6 text-mid" data-lit>
          {t.tagline}
        </p>
      </MetaLight>

      <section className="mx-[var(--margin)] mt-[7svh] grid gap-y-14 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:sticky md:top-[16svh] md:col-span-6 md:self-start md:pt-1">
          {/* the story is his to write; until then the placeholder stays out of the page */}
          {!t.story.startsWith("[") && (
            <p className="type-lead max-w-[54ch] text-mid [text-wrap:pretty]">{t.story}</p>
          )}
          <p className="type-meta-sm mt-8 max-w-[54ch] text-low [text-wrap:pretty]" data-lit>
            {t.windhover}
          </p>
        </MetaLight>
        <MetaLight className="md:col-span-5 md:col-start-8">
          <dl className="type-meta border-t border-hairline text-mid">
            {rows(lang).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-hairline py-3">
                <dt className="w-[7.5rem] shrink-0 text-low" data-lit>
                  {k}
                </dt>
                <dd className="m-0 min-w-0 max-w-[34ch] text-right text-value [text-wrap:balance]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={path(lang, "/inquiry")} className="btn">
              <span className="btn-label">{t.write}</span>
              <span className="btn-arrow" aria-hidden="true">
                <span>→</span>
              </span>
            </Link>
            <a data-selectable href="mailto:hello@kestrra.com" className="dev-link t-color type-meta" data-lit>
              hello@kestrra.com
            </a>
          </div>
        </MetaLight>
      </section>

      {/* who hired the work: the two biggest names take the large tiles, the
          next one a wide tile, in the order of content/clients.ts */}
      <section aria-labelledby="clients-grid-head" className="mx-[var(--margin)] mt-[9svh]">
        <MetaLight className="flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 id="clients-grid-head" className="type-meta-sm text-low" data-lit>
            {t.rows.clients}
          </h2>
        </MetaLight>
        <ul className="about-bento mt-6">
          {CLIENTS.map((c, i) => {
            const short = c.name.split(" · ")[0];
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.mark.src} alt="" width={c.mark.w} height={c.mark.h} loading="lazy" />
                <span className="type-meta-sm" data-lit>
                  {short}
                </span>
              </>
            );
            return (
              <li key={c.name} className={i < 2 ? "big" : i === 2 ? "wide" : undefined}>
                {c.href?.startsWith("http") ? (
                  <a href={c.href} target="_blank" rel="noopener noreferrer" title={c.name} className="about-tile">
                    {inner}
                  </a>
                ) : c.href ? (
                  <Link href={path(lang, c.href)} title={c.name} className="about-tile">
                    {inner}
                  </Link>
                ) : (
                  <span title={c.name} className="about-tile">
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

    </main>
  );
}
