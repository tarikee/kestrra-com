import { Link } from "next-view-transitions";
import { CLIENTS, type Client } from "@/content/clients";
import { PRESS } from "@/content/press";
import { MetaLight } from "@/components/letter-light";
import { dict } from "@/dictionaries";
import { fmt, path, type Lang } from "@/lib/i18n";

/* Every mark gets the same visual area, so a long wordmark and a tall
   emblem weigh the same; the caps keep the extremes in the row. */
const AREA = 5000;
const MAX_W = 168;
const MAX_H = 58;

/* The row drifts as one loop: the track holds the clients COPIES times, the
   animation moves it by exactly half, and each half is wider than any screen,
   so the seam never shows. */
const COPIES = 6;

/* the press marks ride in the same row, right after the first client */
const MARKS: Client[] = [
  CLIENTS[0],
  ...PRESS.map((p) => ({ name: p.outlet, mark: p.mark, href: p.site })),
  ...CLIENTS.slice(1),
];

function size(w: number, h: number, area = 1) {
  const r = w / h;
  let width = Math.sqrt(AREA * area * r);
  let height = width / r;
  if (width > MAX_W) [width, height] = [MAX_W, MAX_W / r];
  if (height > MAX_H) [width, height] = [MAX_H * r, MAX_H];
  return { width: Math.round(width), height: Math.round(height) };
}

function Mark({ c, copy, lang }: { c: Client; copy: boolean; lang: Lang }) {
  const t = dict(lang).home.clients;
  const { width, height } = size(c.mark.w, c.mark.h, c.mark.area);
  const img = (
    <img
      src={c.mark.src}
      alt={copy ? "" : c.name}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="block opacity-55 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:opacity-90"
      style={{ width: `calc(${width}px * var(--k))`, height: "auto" }}
    />
  );
  if (c.href?.startsWith("http")) {
    return (
      <a
        href={c.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
        aria-label={copy ? undefined : fmt(t.seeWorkTab, { name: c.name })}
        tabIndex={copy ? -1 : undefined}
      >
        {img}
      </a>
    );
  }
  return c.href ? (
    <Link
      href={path(lang, c.href)}
      className="group block"
      aria-label={copy ? undefined : fmt(t.seeWork, { name: c.name })}
      tabIndex={copy ? -1 : undefined}
    >
      {img}
    </Link>
  ) : (
    <div className="group">{img}</div>
  );
}

/** The clients row under the hero: marks in luminance only (DESIGN.md §8b),
    drifting left to right, paused while the pointer is on a mark and still for reduced
    motion. The ones with work on this site link to it. */
export function Clients({ className = "", lang }: { className?: string; lang: Lang }) {
  return (
    <section aria-labelledby="clients-head" className={className}>
      <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between pb-4">
        <h2 id="clients-head" className="type-meta-sm text-low" data-lit>
          {dict(lang).home.clients.head}
        </h2>
      </MetaLight>
      <div className="clients-marquee py-16 [--k:0.78] md:[--k:1]">
        <ul className="clients-track">
          {Array.from({ length: COPIES }, (_, i) =>
            MARKS.map((c) => (
              <li
                key={`${i}-${c.name}`}
                className={i > 0 ? "clients-copy" : undefined}
                aria-hidden={i > 0 ? true : undefined}
                title={c.name}
              >
                <Mark c={c} copy={i > 0} lang={lang} />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
