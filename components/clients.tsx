import { Link } from "next-view-transitions";
import { CLIENTS, type Client } from "@/content/clients";
import { MetaLight } from "@/components/letter-light";

/* Every mark gets the same visual area, so a long wordmark and a tall
   emblem weigh the same; the caps keep the extremes in the row. */
const AREA = 5000;
const MAX_W = 168;
const MAX_H = 58;

/* The row drifts as one loop: the track holds the clients COPIES times, the
   animation moves it by exactly half, and each half is wider than any screen,
   so the seam never shows. */
const COPIES = 6;

function size(w: number, h: number) {
  const r = w / h;
  let width = Math.sqrt(AREA * r);
  let height = width / r;
  if (width > MAX_W) [width, height] = [MAX_W, MAX_W / r];
  if (height > MAX_H) [width, height] = [MAX_H * r, MAX_H];
  return { width: Math.round(width), height: Math.round(height) };
}

function Mark({ c, copy }: { c: Client; copy: boolean }) {
  const { width, height } = size(c.mark.w, c.mark.h);
  const img = (
    <img
      src={c.mark.src}
      alt={copy ? "" : c.name}
      width={width}
      height={height}
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
        aria-label={copy ? undefined : `${c.name}: see the work (opens in a new tab)`}
        tabIndex={copy ? -1 : undefined}
      >
        {img}
      </a>
    );
  }
  return c.href ? (
    <Link
      href={c.href}
      className="group block"
      aria-label={copy ? undefined : `${c.name}: see the work`}
      tabIndex={copy ? -1 : undefined}
    >
      {img}
    </Link>
  ) : (
    <div className="group">{img}</div>
  );
}

/** The clients row under the hero: marks in luminance only (DESIGN.md §8b),
    drifting left to right, paused under the pointer and still for reduced
    motion. The ones with work on this site link to it. */
export function Clients({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="clients-head" className={className}>
      <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
        <h2 id="clients-head" className="type-meta-sm text-low" data-lit>
          Worked with
        </h2>
      </MetaLight>
      <div className="clients-marquee py-12 [--k:0.78] md:py-14 md:[--k:1]">
        <ul className="clients-track">
          {Array.from({ length: COPIES }, (_, i) =>
            CLIENTS.map((c) => (
              <li
                key={`${i}-${c.name}`}
                className={i > 0 ? "clients-copy" : undefined}
                aria-hidden={i > 0 ? true : undefined}
                title={c.name}
              >
                <Mark c={c} copy={i > 0} />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
