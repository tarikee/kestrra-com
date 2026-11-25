import { Link } from "next-view-transitions";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { dict } from "@/dictionaries";
import { path, type Lang } from "@/lib/i18n";

/** The quiet way out of a page of work: one question, one link to the form. */
export function InquiryCta({
  lang,
  question,
  className = "mt-[22svh]",
  label,
  action,
  href = "/inquiry",
}: {
  lang: Lang;
  question: string;
  className?: string;
  label?: string;
  action?: string;
  /** English path; `/inquiry?for=photo|web|both` preselects what the form is for */
  href?: string;
}) {
  const t = dict(lang).inquiry;
  return (
    <section className={`mx-[var(--margin)] ${className}`}>
      <Link href={path(lang, href)} className="group block border-t border-hairline pt-10">
        <MetaLight>
          <p className="type-meta-sm text-low" data-lit>
            {label ?? t.ctaLabel}
          </p>
          <LetterLight as="p" className="type-d1 mt-4 max-w-[16ch] text-hi">
            {question}
          </LetterLight>
          <p
            className="type-meta mt-8 text-mid transition-colors duration-[var(--duration-fast)] group-hover:text-hi"
            data-lit
          >
            {action ?? t.ctaAction}
          </p>
        </MetaLight>
      </Link>
    </section>
  );
}
