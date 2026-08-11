import type { ClientCredit as Credit } from "@/content/sets";

/**
 * Credit at the set level, on the work the client actually commissioned
 * (DESIGN.md §8b). Never a logo wall. Marks render in luminance only —
 * white at reduced opacity, never brand colour.
 */
export function ClientCredit({
  credit,
  className = "",
}: {
  credit: Credit;
  className?: string;
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
      <span className="type-meta-sm text-low transition-colors duration-[var(--duration-fast)] group-hover:text-mid">
        {credit.url ? `${credit.name} ↗` : credit.name}
      </span>
    </>
  );

  return (
    <div className={className}>
      <p className="type-meta-sm mb-3 text-low">Commissioned by</p>
      {credit.url ? (
        <a
          href={credit.url}
          rel="noopener"
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
