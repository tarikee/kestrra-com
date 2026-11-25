import { og } from "@/lib/og";
import type { Metadata } from "next";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { dict } from "@/dictionaries";
import { alternates, isLang, type Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "en";
  const m = dict(lang).meta.privacy;
  return {
    title: m.title,
    robots: { index: false, follow: true },
    description: m.description,
    alternates: alternates("/privacy", lang),
    openGraph: og(lang),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "en";
  const t = dict(lang).privacy;
  const rows: { head: string; body: React.ReactNode }[] = [
    {
      head: t.whoHead,
      body: (
        <>
          {t.whoText}{" "}
          <a data-selectable href={`mailto:${t.email}`} className="dev-link t-color">
          {t.email}
        </a>
        </>
      ),
    },
    ...t.rows,
  ];
  return (
    <main className="mx-[var(--margin)] pt-[12svh] md:pt-[15svh]">
      <header>
        <MetaLight>
          <p className="type-meta-sm text-low" data-lit>
            {t.eyebrow}
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            {t.title}
          </LetterLight>
          <p className="type-meta mt-6 text-mid" data-lit>
            {t.sub}
          </p>
        </MetaLight>
      </header>
      <MetaLight>
        <dl className="mt-[7svh] max-w-[880px]">
          {rows.map((r) => (
            <div key={r.head} className="grid gap-y-2 border-t border-hairline py-6 md:grid-cols-[14rem_1fr] md:gap-x-[2.5vw]">
              <dt className="type-meta-sm text-low" data-lit>
                {r.head}
              </dt>
              <dd className="type-body max-w-[60ch] text-mid" data-selectable>
                {r.body}
              </dd>
            </div>
          ))}
        </dl>
      </MetaLight>
    </main>
  );
}
