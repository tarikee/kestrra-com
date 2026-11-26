import { og } from "@/lib/og";
import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";
import { notFound } from "next/navigation";
import { dict } from "@/dictionaries";
import { alternates, isLang } from "@/lib/i18n";
import { LetterLight, MetaLight } from "@/components/letter-light";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.inquiry;
  return {
    title: m.title,
    description: m.description,
    alternates: alternates("/inquiry", lang),
    openGraph: og(lang),
  };
}

export default async function InquiryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang).inquiry;
  return (
    <main className="mx-[var(--margin)] pt-[12svh] md:pt-[15svh]">
      <header className="grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:col-span-7">
          <p className="type-meta-sm text-low" data-lit>
            {t.eyebrow}
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            {t.h1}
          </LetterLight>
          <p className="type-meta mt-6 text-mid" data-lit>
            <span className="whitespace-nowrap">{t.reply}</span>{" "}
            <span className="whitespace-nowrap">{t.replyLang}</span>
          </p>
        </MetaLight>
        <MetaLight className="max-w-[40ch] md:col-span-4 md:col-start-9 md:self-end">
          <p className="type-body text-mid [text-wrap:pretty]">
            {t.body}
          </p>
        </MetaLight>
      </header>

      <div className="mt-[7svh] md:grid md:grid-cols-12 md:gap-x-[2.5vw]">
        <div className="md:col-span-7">
          <InquiryForm />
        </div>
        {/* only what happens after sending; who he worked for lives on home and About */}
        <MetaLight className="mt-[8svh] md:col-span-4 md:col-start-9 md:mt-0">
          <p className="type-meta max-w-[40ch] border-t border-hairline pt-4 text-mid [text-wrap:pretty]" data-lit>
            {t.next}
          </p>
        </MetaLight>
      </div>
    </main>
  );
}
