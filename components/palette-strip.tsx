import { dict } from "@/dictionaries";
import type { Lang } from "@/lib/i18n";

/**
 * Color signature per set (DESIGN.md §0) — extracted from the actual images,
 * never invented. Honest information for a colorist's client. Kept quiet.
 */
export function PaletteStrip({
  colors,
  className = "",
  lang = "en",
}: {
  colors: string[];
  className?: string;
  lang?: Lang;
}) {
  if (colors.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-2 ${className}`} aria-label={dict(lang).sets.palette}>
      {colors.map((c) => (
        <div key={c}>
          <div className="h-2 w-9" style={{ background: c }} />
          <div className="type-meta-sm mt-1.5 text-low lowercase">{c}</div>
        </div>
      ))}
    </div>
  );
}
