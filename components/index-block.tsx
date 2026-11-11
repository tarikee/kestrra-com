import { Link } from "next-view-transitions";
import type { WorkImage, WorkSet } from "@/lib/work";
import { Pic } from "./pic";
import { PaletteStrip } from "./palette-strip";
import { PointerField } from "./pointer-field";
import { LetterLight, MetaLight } from "./letter-light";
import { FrameWindow, type WindowFrame } from "./frame-window";

/**
 * One set on the index — the windhover block (DESIGN.md §1).
 *
 * The set shows one frame at a time in a window of the cover's shape: the
 * cover first, then the set's picks, each developing in over the last
 * (components/frame-window.tsx). Beside it, the plate: number, title, the
 * lab slip, the colour bar. The whole row is the way into the set.
 *
 * The block sits in a pointer field: the set's light, the window and the
 * plate each ease toward where you are, at their own rate, so the depth is
 * something you can feel and not just something you can see.
 */

/** what crosses to the window: only the cover paints before it loads, so
    only the cover carries its thumbhash */
const slim = (img: WorkImage, cover: boolean): WindowFrame => ({
  id: img.id,
  w: img.w,
  h: img.h,
  avif: img.avif,
  webp: img.webp,
  base: img.base,
  dominant: img.dominant,
  alt: img.alt,
  thumb: cover ? img.thumb : "",
});

/**
 * The set's own light, at block scale — the furthest plane. Built from the
 * palette extracted from the frames themselves, never from a photograph
 * that has been altered: three soft washes, blurred past recognition, so
 * the block sits in a pool of the colour the work is made of.
 */
function SetLight({ palette, right }: { palette: string[]; right: boolean }) {
  const [a, b, c] = [
    palette[0] ?? "#6a6a6a",
    palette[1] ?? palette[0] ?? "#5a5a5a",
    palette[2] ?? palette[0] ?? "#4a4a4a",
  ];
  const near = right ? "72%" : "28%";
  const far = right ? "26%" : "74%";
  return (
    // two elements on purpose: .set-light owns the breathing animation, which
    // writes `transform`, so the pointer lean has to live on a wrapper or the
    // keyframes would overwrite it
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
      style={{
        // the light leans with you, very slightly — it is the furthest plane,
        // so it moves least of anything in the block
        transform: "translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 6px), 0)",
      }}
    >
      <div
        className="set-light h-full w-full"
        style={{
          background: `
            radial-gradient(ellipse 46% 32% at ${near} 46%, ${a} 0%, transparent 68%),
            radial-gradient(ellipse 34% 26% at ${far} 74%, ${b} 0%, transparent 70%),
            radial-gradient(ellipse 30% 22% at ${near} 12%, ${c} 0%, transparent 72%)
          `,
          filter: "blur(38px)",
          opacity: 0.16,
        }}
      />
    </div>
  );
}

/**
 * The edge printing. 35mm carries the stock and the frame number down the
 * sprocket margin; this carries the set. It is the quietest thing in the
 * block and the one that makes it read as film rather than as a web page.
 */
function FilmEdge({ set }: { set: WorkSet }) {
  const line = `KESTRRA · ${set.def.title} · ${set.def.when} · ${set.images.length} FRAMES`;
  return (
    <div
      className="pointer-events-none absolute inset-y-0 hidden select-none overflow-hidden md:block"
      style={{ width: "1.6rem", left: "-2.4rem" }}
      aria-hidden="true"
    >
      <p
        className="type-meta-sm absolute left-1/2 top-1/2 whitespace-nowrap uppercase text-hi"
        style={{
          transform: "translate(-50%, -50%) rotate(-90deg)",
          letterSpacing: "0.42em",
          opacity: 0.14,
          fontSize: "0.6875rem",
        }}
      >
        {line} &nbsp;·&nbsp; {line}
      </p>
    </div>
  );
}

/** the lab slip — three facts, ruled, the way a print gets recorded */
function DataSlip({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-6 border-t border-hairline">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-4 border-b border-hairline py-[0.4rem]"
        >
          <dt className="type-meta-sm text-low" data-lit>
            {k}
          </dt>
          <dd className="type-meta-sm text-mid" data-lit>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function IndexBlock({ set, index }: { set: WorkSet; index: number }) {
  const { def, cover, satellites, palette, spill } = set;
  const nn = String(index + 1).padStart(2, "0");
  const right = index % 2 === 0; // focal side alternates; 01 sits right
  const meta = [def.discipline, def.when, `${set.images.length} frames`].join(" · ");

  if (def.mode === "sequence") return <ThresholdBlock set={set} index={index} />;

  const frames = [slim(cover, true), ...satellites.map((img) => slim(img, false))];

  return (
    <Link
      href={`/work/${def.slug}`}
      data-spill={spill}
      className="group relative block focus-visible:outline-none"
      aria-label={`Open set: ${def.title} — ${meta}`}
    >
      {/* clip, not hidden — the set's light may bleed off the page edge
          without ever opening a horizontal scrollbar */}
      <PointerField className="relative overflow-x-clip">
        <SetLight palette={palette} right={right} />

        <div className="relative z-10 md:flex md:min-h-svh md:items-center">
          <div className="grid w-full grid-cols-1 items-center gap-y-8 px-[var(--margin)] py-16 md:grid-cols-12 md:gap-x-[2.5vw] md:py-[8svh]">
            <div
              className={`relative z-10 md:col-span-8 ${
                right ? "md:order-2 md:col-start-5" : "md:col-start-1"
              }`}
              style={{
                // the windhover barely moves — it is the one thing holding
                // still while everything else leans
                transform: "translate3d(calc(var(--px, 0) * -4px), calc(var(--py, 0) * -3px), 0)",
              }}
            >
              <FrameWindow
                frames={frames}
                title={def.title}
                index={index}
                sizes="(min-width: 768px) 64vw, calc(100vw - 2.5rem)"
                maxH="80svh"
                priority={index === 0}
                vtPrefix={`frame-${def.slug}`}
                className="transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:[filter:drop-shadow(0_0_60px_rgb(255_255_255/0.10))]"
              />
            </div>

            {/* the plate — number, title, the lab slip, the colour bar. The
                whole column is one light field: the mono has no weight axis to
                open, so the small type answers in luminance instead. */}
            <MetaLight
              className={`relative z-30 md:col-span-3 ${
                right ? "md:order-1 md:col-start-1" : "md:col-start-10"
              }`}
              style={{
                transform: "translate3d(calc(var(--px, 0) * 7px), calc(var(--py, 0) * 5px), 0)",
              }}
            >
              <FilmEdge set={set} />

              <div className="flex items-center gap-3">
                <span className="type-meta-sm text-mid" data-lit>
                  {nn}
                </span>
                <span className="plate-rule h-px flex-1 bg-hairline-strong" />
                <span className="type-meta-sm text-mid" data-lit>
                  {def.kind === "commissioned" ? "commissioned" : "personal"}
                </span>
              </div>

              <LetterLight className="type-d2 set-title mt-4 text-hi">{def.title}</LetterLight>

              <DataSlip
                rows={[
                  ["discipline", def.discipline],
                  ["shot", def.when],
                  ["frames", String(set.images.length)],
                ]}
              />

              {/* the blurb is left alone — a travelling light across reading
                  copy fights the reading */}
              <p className="type-body mt-6 max-w-[32ch] text-mid">{def.blurb}</p>
              {def.client && (
                <p className="type-meta-sm mt-4 text-mid" data-lit>
                  for {def.client.name}
                </p>
              )}
              <PaletteStrip colors={palette} className="mt-7" />
              <p
                className="type-meta-sm mt-9 flex items-center gap-2 text-low transition-colors duration-[var(--duration-fast)] group-hover:text-hi"
                data-lit
              >
                open set
                <span className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:translate-x-1">
                  →
                </span>
              </p>
            </MetaLight>
          </div>
        </div>
      </PointerField>
    </Link>
  );
}

/**
 * Gora Polaroids — its own entry point, apart from the row of commissioned
 * work (§8). A threshold, not a card.
 *
 * It stays apart, but it is not adrift: it keeps the index's plate grammar,
 * it lies in the same pool of its own light as every other block, a hairline
 * runs down into it from the row above and out the other side, and three
 * frames hang far behind it, out of focus — the sequence glimpsed through
 * the door rather than a lone card in a void.
 */
function ThresholdBlock({ set, index }: { set: WorkSet; index: number }) {
  const { def, cover, satellites, palette, spill } = set;
  const nn = String(index + 1).padStart(2, "0");

  const behind = [
    { left: "12%", top: "16%", width: "13vw", drift: "6vh", rate: 0.5 },
    { right: "11%", top: "26%", width: "11vw", drift: "-5vh", rate: 0.62 },
    { left: "18%", bottom: "12%", width: "12vw", drift: "4vh", rate: 0.44 },
  ] as const;

  return (
    <Link
      href={`/work/${def.slug}`}
      data-spill={spill}
      className="group relative block focus-visible:outline-none"
      aria-label={`Enter the sequence: ${def.title} — ${set.images.length} frames, in order`}
    >
      <PointerField className="relative overflow-x-clip">
        <SetLight palette={palette} right={false} />

        {/* the thread — one hairline running down out of the index, through
            the threshold, and on to whatever is next. It is what stops this
            block reading as a card someone left behind. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgb(255 255 255 / 0.11) 16%, rgb(255 255 255 / 0.11) 84%, transparent)",
          }}
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
          {behind.map((pos, i) => {
            // Gora carries no satellites — take frames from inside the
            // sequence instead, skipping the cover so the door is not just
            // the same picture three more times
            const img = satellites[i] ?? set.images[(i + 1) * 3];
            if (!img) return null;
            return (
              <div
                key={img.id}
                className="absolute z-[1]"
                style={{
                  left: "left" in pos ? pos.left : undefined,
                  right: "right" in pos ? pos.right : undefined,
                  top: "top" in pos ? pos.top : undefined,
                  bottom: "bottom" in pos ? pos.bottom : undefined,
                  width: pos.width,
                  transform: `translate3d(calc(var(--px, 0) * ${pos.rate * 18}px), calc(var(--py, 0) * ${
                    pos.rate * 12
                  }px), 0)`,
                }}
              >
                <div
                  className="sat-drift develop-on-view"
                  style={{ ["--drift" as string]: pos.drift }}
                >
                  <div
                    className="depth-far pointer-events-auto"
                    style={{ ["--blur-rest"]: "3.4px", opacity: 0.72 } as React.CSSProperties}
                  >
                    <Pic img={{ ...img, alt: "" }} sizes="14vw" imgClassName="h-auto w-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* transparent to the pointer except over the plate itself, so the
            frames hanging behind it can still be reached — see the note on
            the same layer in IndexBlock */}
        <div className="relative z-10 flex min-h-[104svh] items-center justify-center px-[var(--margin)] md:pointer-events-none">
          <MetaLight
            className="w-full max-w-[460px] text-center md:pointer-events-auto"
            style={{
              transform: "translate3d(calc(var(--px, 0) * 6px), calc(var(--py, 0) * 4px), 0)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="type-meta-sm text-mid" data-lit>
                {nn}
              </span>
              <span className="plate-rule h-px flex-1 bg-hairline-strong" />
              <span className="type-meta-sm text-mid" data-lit>
                sequence
              </span>
            </div>

            <div className="develop-on-view mt-9">
              <Pic
                img={cover}
                sizes="(min-width: 768px) 460px, 86vw"
                imgClassName="h-auto w-full"
                className="transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:[filter:drop-shadow(0_0_50px_rgb(255_255_255/0.12))]"
                vtName={`frame-${def.slug}-${cover.id}`}
              />
            </div>
            <LetterLight className="type-d3 set-title mt-9 text-hi">{def.title}</LetterLight>
            <p className="type-meta mt-3 text-mid" data-lit>
              {set.images.length} frames · in order · {def.when}
            </p>
            <p className="type-body mx-auto mt-5 max-w-[34ch] text-mid">{def.blurb}</p>
            <p
              className="type-meta-sm mt-10 inline-flex items-center gap-2 text-low transition-colors duration-[var(--duration-fast)] group-hover:text-hi"
              data-lit
            >
              enter
              <span className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:translate-x-1">
                →
              </span>
            </p>
          </MetaLight>
        </div>
      </PointerField>
    </Link>
  );
}
