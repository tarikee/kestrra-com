import { Link } from "next-view-transitions";
import { CLIENTS, type Client } from "@/content/clients";
import { MetaLight } from "@/components/letter-light";

/* Every mark gets the same visual area, so a long wordmark and a tall
   emblem weigh the same; the caps keep the extremes in the row. */
const AREA = 5000;
const MAX_W = 168;
const MAX_H = 58;

function size(w: number, h: number) {
  const r = w / h;
  let width = Math.sqrt(AREA * r);
  let height = width / r;
  if (width > MAX_W) [width, height] = [MAX_W, MAX_W / r];
  if (height > MAX_H) [width, height] = [MAX_H * r, MAX_H];
  return { width: Math.round(width), height: Math.round(height) };
}

function Mark({ c }: { c: Client }) {
  if (!c.mark) {
    return (
      <span className="type-meta-sm block text-center uppercase leading-[1.7] tracking-[0.2em] text-mid transition-colors duration-[var(--duration-fast)] group-hover:text-hi" data-lit>
        {c.name.split(" ").slice(0, -1).join(" ")}
        <br />
        {c.name.split(" ").slice(-1)}
      </span>
    );
  }
  const { width, height } = size(c.mark.w, c.mark.h);
  return (
    <img
      src={c.mark.src}
      alt={c.name}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className="block opacity-55 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:opacity-90"
      style={{ width: `calc(${width}px * var(--k))`, height: "auto" }}
    />
  );
}

/** The clients row on the home page. Marks in luminance only (DESIGN.md §8b);
    the ones with work on this site link to it. */
export function Clients() {
  return (
    <section aria-labelledby="clients-head" className="mx-[var(--margin)] mt-[22svh]">
      <MetaLight className="flex items-baseline justify-between border-b border-hairline pb-4">
        <h2 id="clients-head" className="type-meta-sm text-low" data-lit>
          Worked with
        </h2>
        <p className="type-meta-sm text-low" data-lit>
          {String(CLIENTS.length).padStart(2, "0")} clients
        </p>
      </MetaLight>
      <MetaLight>
        <ul className="flex flex-wrap items-center justify-center gap-x-[clamp(32px,5vw,72px)] gap-y-12 py-14 [--k:0.78] md:justify-between md:[--k:1]">
          {CLIENTS.map((c) => (
            <li key={c.name} title={c.name}>
              {c.href ? (
                <Link href={c.href} className="group block" aria-label={`${c.name}: see the work`}>
                  <Mark c={c} />
                </Link>
              ) : (
                <div className="group">
                  <Mark c={c} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </MetaLight>
    </section>
  );
}
