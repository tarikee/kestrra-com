/**
 * Instagram and GitHub, as this room would draw them.
 *
 * Both marks are drawn in hairline stroke and currentColor, never the brand
 * colours: UI here carries zero chroma, and the only sanctioned colour is
 * light sampled from the work.
 *
 * One part of each mark answers the pointer — the lens on the camera, the
 * head on the cat. It takes light as you approach, the same grammar every
 * other control here uses. Nothing moves; the light changes.
 *
 * The glyph is set inline at the text's size and centred on its letters, so
 * it reads as a word of the line it sits in, not an icon floating above it.
 */

export const INSTAGRAM = { href: "https://instagram.com/kestrra", handle: "@kestrra" } as const;
export const GITHUB = { href: "https://github.com/tarikee", handle: "tarikee" } as const;

export function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`mark-glyph ${className}`}
    >
      <rect
        className="mark-rest"
        x="2.6"
        y="2.6"
        width="18.8"
        height="18.8"
        rx="5.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* the aperture — the part that lights */}
      <circle className="mark-light" cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.4" />
      <circle className="mark-rest" cx="17.2" cy="6.8" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`mark-glyph ${className}`}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* outline after Feather's github icon (MIT), brought to the same
          optical size as the camera; the stroke is widened by the same
          factor so it draws at the camera's 1.4 */}
      <g transform="translate(12 12) scale(0.88) translate(-11.75 -11.33)" strokeWidth="1.6">
        {/* the head — the part that lights */}
        <path
          className="mark-light"
          d="M16 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
        />
        <path className="mark-rest" d="M9 19c-5 1.5-5-2.5-7-3" />
      </g>
    </svg>
  );
}

/**
 * The link itself. Icon alone by default — the label and title carry the
 * name — or icon and handle together where a row already says which
 * service it is.
 */
export function SocialLink({
  kind,
  href,
  withHandle = false,
  className = "",
  ...rest
}: {
  kind: "instagram" | "github";
  /** defaults to the profile */
  href?: string;
  /** show the handle as text after the glyph */
  withHandle?: boolean;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  const ig = kind === "instagram";
  const who = ig ? INSTAGRAM : GITHUB;
  const name = ig ? `Instagram, ${who.handle}` : "GitHub";
  return (
    <a
      href={href ?? who.href}
      rel="noopener"
      aria-label={name}
      title={ig ? `Instagram — ${who.handle}` : `GitHub — ${who.handle}`}
      className={`mark-link ${className}`}
      {...rest}
    >
      {ig ? <InstagramMark /> : <GitHubMark />}
      {withHandle && <span className="mark-handle">{who.handle}</span>}
    </a>
  );
}
