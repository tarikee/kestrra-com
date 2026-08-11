/**
 * Colour signature per set (DESIGN.md §0) — extracted from the actual images,
 * never invented. Honest information for a colourist's client. Kept quiet.
 */
export function PaletteStrip({
  colors,
  className = "",
}: {
  colors: string[];
  className?: string;
}) {
  if (colors.length === 0) return null;
  return (
    <div className={`flex gap-3 ${className}`} aria-label="Extracted set palette">
      {colors.map((c) => (
        <div key={c}>
          <div className="h-2 w-9" style={{ background: c }} />
          <div className="type-meta-sm mt-1.5 text-low lowercase">{c}</div>
        </div>
      ))}
    </div>
  );
}
