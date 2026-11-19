import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { CraftSwitch } from "@/components/craft-switch";
import { GlitchMark } from "@/components/hero-frame";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { PointerField } from "@/components/pointer-field";
import { EMPLOYER_LINKS, EMPLOYER_NAME, shownProjects } from "@/components/dev-projects";
import { DevRow } from "@/components/dev-work";
import { SocialLink } from "@/components/social";

export const metadata: Metadata = {
  title: "Web developer in Belgrade: websites and apps",
  description:
    "I build websites, apps and software for businesses, and tools of my own, from Belgrade. Apartment Renovation NYC, Frames, aether and more, with live links.",
};

export default function DevPage() {
  const projects = shownProjects();

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
              <span className="sr-only">Kestrra, websites, apps and software, built in Belgrade</span>
            </h1>
            <p className="type-meta mt-6 text-mid" data-lit>
              websites · apps · tools
            </p>
            <p className="type-lead mt-4 max-w-[30ch] text-balance text-hi">
              Websites and apps for businesses, and tools built in-house.
            </p>
            <p className="type-body mt-2 max-w-[48ch] text-mid">
              Designed, built and shipped start to finish. This site included.
            </p>
            <p className="type-meta-sm mt-3 text-mid" data-lit>
              Lead developer at{" "}
              <a href="https://lenkailic-architecture.com/" target="_blank" rel="noopener noreferrer" className="dev-link t-color">
                Lenka Ilic Architecture ↗
              </a>
            </p>
            {EMPLOYER_LINKS.length > 0 && (
              <p
                aria-label="For employers"
                className="type-meta-sm mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2"
              >
                <span className="text-mid" data-lit>
                  for employers:
                </span>
                <span className="text-mid" data-lit>
                  {EMPLOYER_NAME}
                </span>
                <span className="whitespace-nowrap text-mid" data-lit>
                  <span className="text-low" aria-hidden="true">· </span>
                  computer science, University of Belgrade
                </span>
                {EMPLOYER_LINKS.map((l) => (
                  <span key={l.href} className="whitespace-nowrap">
                    <span className="text-low" aria-hidden="true">· </span>
                    {l.href.startsWith("https://github.com/") ? (
                      <SocialLink
                        kind="github"
                        href={l.href}
                        className="tap t-color text-mid hover:text-hi"
                        data-lit
                      />
                    ) : (
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        data-selectable={l.href.startsWith("mailto:") ? true : undefined}
                        className="dev-link t-color"
                        data-lit
                      >
                        {l.label}
                        {l.href.startsWith("http") && !l.label.includes("↗") ? " ↗" : ""}
                      </a>
                    )}
                  </span>
                ))}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/inquiry" className="btn">
                <span className="btn-label">write to me</span>
                <span className="btn-arrow" aria-hidden="true">
                  <span>→</span>
                </span>
              </Link>
              <a href="#projects" className="dev-link t-color type-meta" data-lit>
                development ↓
              </a>
            </div>
          </MetaLight>
        </header>
      </PointerField>

      <section id="projects" aria-labelledby="projects-head" className="mx-[var(--margin)] mt-[7svh] scroll-mt-24">
        <MetaLight className="flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 id="projects-head" className="type-meta-sm text-low" data-lit>
            Development · websites, apps and tools
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            selected work
          </p>
        </MetaLight>
        <div className="mt-20 flex flex-col gap-[16svh]">
          {projects.map((p, i) => (
            <DevRow key={p.slug} p={p} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-[var(--margin)] mt-[22svh]">
        <Link href="/inquiry" className="group block border-t border-hairline pt-10">
          <MetaLight>
            <p className="type-meta-sm text-low" data-lit>
              Inquiries
            </p>
            <LetterLight as="p" className="type-d1 mt-4 max-w-[16ch] text-hi">
              A website or an app in mind?
            </LetterLight>
            <p
              className="type-meta mt-8 text-mid transition-colors duration-[var(--duration-fast)] group-hover:text-hi"
              data-lit
            >
              write to me →
            </p>
          </MetaLight>
        </Link>
      </section>

    </main>
  );
}
