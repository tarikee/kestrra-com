import type { ClientCredit as Credit } from "@/content/sets";
import { dict } from "@/dictionaries";
import type { Lang } from "@/lib/i18n";

/**
 * Credit at the set level, on the work the client actually commissioned
 * (DESIGN.md §8b). Never a logo wall. Marks render in luminance only —
 * white at reduced opacity, never brand color.
 */
export function ClientCredit({
  credit,
  className = "",
  lang = "en",
}: {
  credit: Credit;
  className?: string;
  lang?: Lang;
}) {
  const body = (
    <>
      {credit.mark && (
        <img
          src={credit.mark}
          alt=""
          width={credit.markMinWidth ?? 140}
          height={40}
          className="h-auto opacity-55 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:opacity-90"
          style={{ width: credit.markMinWidth ?? 140 }}
        />
      )}
      <span className="type-meta-sm text-mid transition-colors duration-[var(--duration-fast)] group-hover:text-hi">
        {credit.url ? `${credit.name} ↗` : credit.name}
      </span>
    </>
  );

  return (
    <div className={className}>
      <p className="type-meta-sm mb-3 text-mid">{dict(lang).set.commissionedBy}</p>
      {credit.url ? (
        <a
          href={credit.url}
          target="_blank" rel="noopener noreferrer"
          className="group flex flex-col items-start gap-3"
        >
          {body}
        </a>
      ) : (
        <div className="group flex flex-col items-start gap-3">{body}</div>
      )}
    </div>
  );
}
