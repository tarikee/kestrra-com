"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { dict } from "@/dictionaries";
import { langFromPath, path } from "@/lib/i18n";

export default function NotFound() {
  const lang = langFromPath(usePathname());
  // the standalone 404 starts as English; match the address
  useEffect(() => {
    document.documentElement.lang = lang === "sr" ? "sr-Latn" : "en";
  }, [lang]);
  const t = dict(lang).notFound;
  return (
    <main className="mx-[var(--margin)] min-h-[70svh] pt-[12svh] md:pt-[15svh]">
      <title>{t.title}</title>
      <meta name="robots" content="noindex, follow" />
      <MetaLight>
        <p className="type-meta-sm text-low" data-lit>
          {t.code}
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          {t.heading}
        </LetterLight>
        <p className="type-meta mt-6 text-mid">{t.body}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={path(lang, "/")} className="btn">
            <span className="btn-label">{t.home}</span>
            <span className="btn-arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </Link>
          <span className="flex flex-wrap gap-x-7 gap-y-3">
            <Link href={path(lang, "/sets")} className="dev-link t-color type-meta" data-lit>
              {t.sets}
            </Link>
            <Link href={path(lang, "/film")} className="dev-link t-color type-meta" data-lit>
              {t.film}
            </Link>
            <Link href={path(lang, "/inquiry")} className="dev-link t-color type-meta" data-lit>
              {t.inquiry}
            </Link>
          </span>
        </div>
      </MetaLight>
    </main>
  );
}
