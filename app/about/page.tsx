import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { SocialLink } from "@/components/social";

const LEAD =
  "I’m Tarik. I photograph, film, and build websites, apps and software in Belgrade, where I study computer science.";

export const metadata: Metadata = {
  title: "About",
  description: LEAD,
};

/** the facts, ruled like the home page's About rows */
const ROWS: [string, React.ReactNode][] = [
  ["Study", <span key="v" data-lit>Computer science, University of Belgrade</span>],
  ["Work", <span key="v" data-lit>Digital lead and developer at Apartment Renovation NYC</span>],
  ["Based", <span key="v" data-lit>Belgrade, Serbia · works across Europe</span>],
  [
    "Email",
    <a key="v" data-selectable href="mailto:hello@kestrra.com" className="t-color hover:text-hi" data-lit>
      hello@kestrra.com
    </a>,
  ],
  ["Instagram", <SocialLink key="v" kind="instagram" withHandle className="t-color hover:text-hi" data-lit />],
  ["GitHub", <SocialLink key="v" kind="github" withHandle className="t-color hover:text-hi" data-lit />],
  ["Inquiries", <span key="v" data-lit>DM, email, or the inquiry form</span>],
];

export default function AboutPage() {
  return (
    <main className="pt-[18svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          About
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Tarik Ramadani
        </LetterLight>
      </MetaLight>

      <section className="mx-[var(--margin)] mt-[10svh] grid gap-y-14 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:col-span-6">
          <p className="type-lead max-w-[54ch] text-hi">{LEAD}</p>
          <p className="type-body mt-6 max-w-[54ch] text-mid">
            Named for the windhover — the kestrel that holds perfectly still
            in moving air. That is the job: stay still, let the day move.
          </p>
        </MetaLight>
        <MetaLight className="md:col-span-5 md:col-start-8">
          <dl className="type-meta text-mid">
            {ROWS.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-hairline py-3">
                <dt className="shrink-0 text-low" data-lit>
                  {k}
                </dt>
                <dd className="m-0 text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </MetaLight>
      </section>

      <MetaLight className="mx-[var(--margin)] mt-[12svh] flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-hairline pt-8">
        <Link href="/inquiry" className="btn">
          <span className="btn-label">write to me</span>
          <span className="btn-arrow" aria-hidden="true">
            <span>→</span>
          </span>
        </Link>
        <span className="flex flex-wrap gap-x-7 gap-y-3">
          <Link href="/work" className="dev-link t-color type-meta" data-lit>
            photo &amp; film →
          </Link>
          <Link href="/dev" className="dev-link t-color type-meta" data-lit>
            development →
          </Link>
        </span>
      </MetaLight>
    </main>
  );
}
