/**
 * The Instagram mark, as this room would draw it.
 *
 * The handle was already in the footer, on the inquiry page and in the
 * practice block — five links, all of them plain text, none of which read as
 * *Instagram* at a glance. So the glyph earns its place: it is the one shape
 * a visitor recognises without reading.
 *
 * Drawn in hairline stroke, never the brand gradient. DESIGN.md is explicit
 * that UI carries zero chroma and that the only sanctioned colour is light
 * sampled from the work — a purple-to-orange logo would be the single most
 * off-key object on the site, and it would date the page besides.
 *
 * The lens is what responds. Its aperture takes light as you approach, the
 * same grammar every other control here uses, which is also a small joke that
 * happens to be true: it is a camera, and this site's whole argument is that
 * light is the subject. Nothing moves — the light changes.
 */
export function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`ig-mark ${className}`}
    >
      <rect
        className="ig-body"
        x="2.6"
        y="2.6"
        width="18.8"
        height="18.8"
        rx="5.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* the aperture — the part that lights */}
      <circle className="ig-lens" cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.4" />
      <circle className="ig-flash" cx="17.2" cy="6.8" r="1.05" fill="currentColor" />
    </svg>
  );
}
