import { Link } from "next-view-transitions";
import { type DevProject, host } from "@/components/dev-projects";
import { LetterLight, MetaLight } from "@/components/letter-light";
import { PointerField } from "@/components/pointer-field";
import { Monitor, RowHit } from "@/components/monitor";
import { DevInfo } from "@/components/dev-info";

const CORPUS = "#5b544d";

const status = (p: DevProject) => (p.live ? "live" : p.code ? "public repo" : "not deployed");

/** where the work opens: the live product, else its code */
const target = (p: DevProject) => p.live ?? p.code;

/** the address on the monitor's chin */
const where = (p: DevProject) => (p.live ? host(p.live) : p.code ? host(p.code) : "local build");

function Screen({ p, sizes, className }: { p: DevProject; sizes: string; className: string }) {
  if (!p.image) return null;
  return (
    <Monitor
      name={p.name}
      live={p.live}
      code={p.code}
      image={p.image}
      sizes={sizes}
      glow={p.spill ?? CORPUS}
      chin={where(p)}
      className={className}
    />
  );
}

/** One project on /dev. It behaves like a set on the index: the whole row
    opens the work, the plate leans with the pointer and takes its light, the
    name grows under it. The monitor and the plate alternate sides. */
export function DevRow({ p, index }: { p: DevProject; index: number }) {
  const nn = String(index + 1).padStart(2, "0");
  const right = index % 2 === 0;
  const href = target(p);

  return (
    <article
      id={p.slug}
      data-spill={p.spill ?? CORPUS}
      aria-labelledby={`dev-${p.slug}`}
      className="group relative scroll-mt-24"
    >
      {/* the whole row opens the work; the monitor and the links are the
          ones keyboards and screen readers get (as the hero's picture) */}
      {href && <RowHit href={href} />}
      <PointerField className="pointer-events-none relative grid grid-cols-1 items-center gap-y-10 md:grid-cols-12 md:gap-x-[2.5vw]">
        {p.image && (
          <div
            className={`min-w-0 md:col-span-5 ${right ? "md:order-2 md:col-start-8" : "md:col-start-1"}`}
            style={{ transform: "translate3d(calc(var(--px, 0) * -4px), calc(var(--py, 0) * -3px), 0)" }}
          >
            <Screen
              p={p}
              sizes="(min-width: 768px) 36vw, 70vw"
              className="pointer-events-auto mx-auto w-[78%] md:w-[94%]"
            />
          </div>
        )}

        <MetaLight
          className={`min-w-0 md:col-span-5 ${right ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}
          style={{ transform: "translate3d(calc(var(--px, 0) * 7px), calc(var(--py, 0) * 5px), 0)" }}
        >
          <div className="flex items-center gap-3">
            <span className="type-meta-sm text-mid" data-lit>
              {nn}
            </span>
            <span className="plate-rule h-px flex-1 bg-hairline-strong" />
            <span className="type-meta-sm text-mid" data-lit>
              {status(p)}
            </span>
          </div>
          <LetterLight as="h3" id={`dev-${p.slug}`} className="type-d2 set-title mt-4 text-hi">
            {p.name}
          </LetterLight>
          {/* reading copy is left out of the light, as a set's blurb is */}
          <p className="type-body mt-4 max-w-[40ch] text-mid">{p.line}</p>
          <DevInfo
            name={p.name}
            lead={
              p.live ? (
                <a href={p.live} rel="noopener" className="dev-link t-color pointer-events-auto" data-lit>
                  visit<span className="sr-only"> {p.name}</span> ↗
                </a>
              ) : p.code ? (
                <a href={p.code} rel="noopener" className="dev-link t-color pointer-events-auto" data-lit>
                  code<span className="sr-only"> for {p.name}</span> ↗
                </a>
              ) : null
            }
          >
            <dl className="type-meta mt-5 border-t border-hairline">
              <Slip k="role">{p.role}</Slip>
              <Slip k="stack">{p.stack.join(" · ")}</Slip>
              {p.year && <Slip k="year">{p.year}</Slip>}
              {p.code && (
                <Slip k="code">
                  <a href={p.code} rel="noopener" className="dev-link t-color pointer-events-auto">
                    {host(p.code)}
                    <span className="sr-only"> (code for {p.name})</span> ↗
                  </a>
                </Slip>
              )}
            </dl>
          </DevInfo>
        </MetaLight>
      </PointerField>
    </article>
  );
}

function Slip({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-hairline py-2.5">
      <dt className="shrink-0 text-low" data-lit>
        {k}
      </dt>
      <dd className="min-w-0 text-right text-mid">{children}</dd>
    </div>
  );
}

/** One flagship on the home page: the monitor, the name, one line. The card
    opens the project's row on /dev; the monitor opens the work itself. */
export function DevCard({ p }: { p: DevProject }) {
  return (
    <article
      data-spill={p.spill ?? CORPUS}
      aria-labelledby={`card-${p.slug}`}
      className="group relative min-w-0"
    >
      <Link
        href={`/dev#${p.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0"
      />
      <div className="pointer-events-none relative">
        {/* a box of one shape for every card, the monitor standing at its
            foot, so a wide terminal and a 16:10 site share a baseline */}
        <div className="md:flex md:aspect-[3/2] md:items-end">
          <Screen
            p={p}
            sizes="(min-width: 768px) 27vw, 70vw"
            className="pointer-events-auto mx-auto w-[78%] md:mx-0 md:w-[88%]"
          />
        </div>
        <LetterLight as="h3" id={`card-${p.slug}`} className="type-d3 set-title mt-8 text-hi">
          {p.name}
        </LetterLight>
        <p className="type-body mt-3 max-w-[40ch] text-mid">{p.line}</p>
      </div>
    </article>
  );
}
