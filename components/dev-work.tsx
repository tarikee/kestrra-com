import Image from "next/image";
import { type DevProject, host } from "@/components/dev-projects";

const CORPUS = "#5b544d";

const status = (p: DevProject) => (p.live ? "live" : p.code ? "public repo" : "not deployed");

/** the address under a frame, like the rebate of a print */
const where = (p: DevProject) => (p.live ? host(p.live) : p.code ? host(p.code) : "local build");

/**
 * The work itself, in a hairline frame — a print on the sheet, never a fake
 * browser. A terminal tool shows real output in mono instead of a picture.
 */
function Shot({ p, sizes, card = false }: { p: DevProject; sizes: string; card?: boolean }) {
  return (
    <figure className="m-0 min-w-0">
      <div className="dev-frame">
        {p.image ? (
          <Image
            src={p.image.src}
            width={p.image.w}
            height={p.image.h}
            alt={p.image.alt}
            sizes={sizes}
            className="block h-auto w-full"
          />
        ) : (
          <pre
            className={`dev-sample ${card ? "dev-sample-card" : ""}`}
            {...(card
              ? { "aria-hidden": true }
              : { tabIndex: 0, role: "region", "aria-label": `${p.name}: real output` })}
          >
            {p.sample}
          </pre>
        )}
      </div>
      <figcaption className="type-meta-sm mt-3 flex justify-between gap-4 text-low">
        <span className="truncate">{where(p)}</span>
        <span className="shrink-0">{p.image ? `${p.image.w} × ${p.image.h}` : "terminal"}</span>
      </figcaption>
    </figure>
  );
}

function Tags({ stack }: { stack: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
      {stack.map((s) => (
        <li key={s} className="dev-tag type-meta-sm">
          {s}
        </li>
      ))}
    </ul>
  );
}

function Links({ p }: { p: DevProject }) {
  if (!p.live && !p.code) return null;
  return (
    <p className="type-meta mt-7 flex flex-wrap gap-x-7 gap-y-3">
      {p.live && (
        <a href={p.live} rel="noopener" className="dev-link t-color">
          visit<span className="sr-only"> {p.name}</span> ↗
        </a>
      )}
      {p.code && (
        <a href={p.code} rel="noopener" className="dev-link t-color">
          code<span className="sr-only"> for {p.name}</span> ↗
        </a>
      )}
    </p>
  );
}

/** One project on /dev — a large row, the frame and its plate alternating
    sides the way the sets do on the index. */
export function DevRow({ p, index }: { p: DevProject; index: number }) {
  const nn = String(index + 1).padStart(2, "0");
  const right = index % 2 === 0;
  const media = Boolean(p.image || p.sample);

  return (
    <article
      data-spill={p.spill ?? CORPUS}
      aria-labelledby={`dev-${p.slug}`}
      className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:items-center md:gap-x-[2.5vw]"
    >
      {media && (
        <div className={`min-w-0 md:col-span-8 ${right ? "md:order-2 md:col-start-5" : "md:col-start-1"}`}>
          <Shot p={p} sizes="(min-width: 768px) 64vw, calc(100vw - 2.5rem)" />
        </div>
      )}

      <div
        className={`min-w-0 ${
          media
            ? `md:col-span-4 ${right ? "md:order-1 md:col-start-1" : "md:col-start-9"}`
            : "md:col-span-6"
        }`}
      >
        <div className="type-meta-sm flex items-center gap-3 text-mid">
          <span>{nn}</span>
          <span className="h-px flex-1 bg-hairline-strong" />
          <span>{status(p)}</span>
        </div>
        <h3 id={`dev-${p.slug}`} className="type-d2 mt-4 text-hi">
          {p.name}
        </h3>
        <p className="type-body mt-4 max-w-[40ch] text-mid">{p.line}</p>
        <dl className="type-meta mt-6 border-t border-hairline">
          <div className="flex justify-between gap-6 border-b border-hairline py-2.5">
            <dt className="text-low">role</dt>
            <dd className="text-right text-mid">{p.role}</dd>
          </div>
        </dl>
        <Tags stack={p.stack} />
        <Links p={p} />
      </div>
    </article>
  );
}

/** One flagship on the home page — the frame, then the words under it. */
export function DevCard({ p }: { p: DevProject }) {
  return (
    <article data-spill={p.spill ?? CORPUS} aria-labelledby={`card-${p.slug}`} className="min-w-0">
      <Shot p={p} sizes="(min-width: 768px) 30vw, calc(100vw - 2.5rem)" card />
      <h3 id={`card-${p.slug}`} className="type-d3 mt-6 text-hi">
        {p.name}
      </h3>
      <p className="type-body mt-3 max-w-[40ch] text-mid">{p.line}</p>
      <Tags stack={p.stack} />
      <Links p={p} />
    </article>
  );
}
