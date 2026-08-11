import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX } from "./wordmark-data";

/** The resolved mark — exact Most Wasted geometry, still. */
export function Wordmark({
  className,
  title = "Kestrra",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      role="img"
      aria-label={title}
    >
      {WORDMARK_GLYPHS.map((g) => (
        <path key={g.char + g.x} transform={`translate(${g.x} 0)`} d={g.d} fill="currentColor" />
      ))}
    </svg>
  );
}
