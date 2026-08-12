import { Link } from "next-view-transitions";
import type { WorkSet } from "@/lib/work";
import { Pic } from "./pic";
import { PaletteStrip } from "./palette-strip";
import { OrbitLoop } from "./orbit-loop";
import { PointerField } from "./pointer-field";

/**
 * One set on the index — the windhover block (DESIGN.md §1).
 *
 * The focal frame pins dead still while the block's extra height scrolls the
 * world past it. The world travels in three planes: a wash of the set's own
 * light furthest back, frames drifting slowly behind the focal (soft, out of
 * focus), and frames passing close in front of it, sharp and fast. The
 * overlap is what makes the depth real — the held frame is inside the scene,
 * not pasted on top of it.
 *
 * The whole block also sits in a pointer field: every plane eases toward
 * where you are, at its own rate, so the depth is something you can feel and
 * not just something you can see. The far plane comes into focus when you
 * reach for it.
 */

interface SatPos {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: string;
  drift: string;
  /** front frames pass over the focal, sharp; back frames sit behind, soft */
  front?: boolean;
}

// Deterministic placements, mirrored for the two focal sides. Front frames
// are held to the outer edges so they break the focal's *frame* as they pass
// — never float over the middle of the photograph — and nothing ever crosses
// the type column.
const SAT_POS: readonly [readonly SatPos[], readonly SatPos[]] = [
  // focal right → the world travels on the right
  [
    { top: "3%", left: "32%", width: "10vw", drift: "9vh", front: true },
    { bottom: "5%", right: "-3%", width: "12vw", drift: "-8vh", front: true },
    { top: "27%", right: "-4%", width: "13vw", drift: "4vh" },
    { top: "63%", left: "39%", width: "10vw", drift: "-3vh" },
    { top: "88%", right: "15%", width: "12vw", drift: "5vh" },
  ],
  // focal left → the world travels on the left
  [
    { top: "4%", right: "31%", width: "10vw", drift: "-9vh", front: true },
    { bottom: "6%", left: "-3%", width: "12vw", drift: "8vh", front: true },
    { top: "28%", left: "-4%", width: "13vw", drift: "-4vh" },
    { top: "64%", right: "38%", width: "10vw", drift: "3vh" },
    { top: "89%", left: "14%", width: "12vw", drift: "-5vh" },
  ],
];

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
          <dt className="type-meta-sm text-low">{k}</dt>
          <dd className="type-meta-sm text-mid">{v}</dd>
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

  const lane = SAT_POS[right ? 0 : 1];

  const place = (pos: SatPos, key: string, children: React.ReactNode) => {
    // near plane leans hardest, far plane barely at all
    const rate = pos.front ? 1 : 0.42;
    return (
      <div
        key={key}
        className={`absolute ${pos.front ? "z-20" : "z-[1]"}`}
        style={{
          top: pos.top,
          bottom: pos.bottom,
          left: pos.left,
          right: pos.right,
          width: pos.width,
          transform: `translate3d(calc(var(--px, 0) * ${rate * 22}px), calc(var(--py, 0) * ${
            rate * 14
          }px), 0)`,
        }}
      >
        <div className="sat-drift develop-on-view" style={{ ["--drift" as string]: pos.drift }}>
          <div
            className={pos.front ? "" : "depth-far pointer-events-auto"}
            style={
              pos.front
                ? undefined
                : ({ ["--blur-rest"]: "2.2px", transform: "scale(0.97)" } as React.CSSProperties)
            }
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Link
      href={`/work/${def.slug}`}
      data-spill={spill}
      className="group relative block focus-visible:outline-none"
      aria-label={`Open set: ${def.title} — ${meta}`}
    >
      {/* clip, not hidden — frames may bleed off the page edge without ever
          opening a horizontal scrollbar, and sticky still works */}
      <PointerField className="relative overflow-x-clip md:h-[172svh]">
        <SetLight palette={palette} right={right} />

        {/* the world that moves past the still centre — in front of it and behind */}
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
          {satellites.map((s, i) =>
            place(
              lane[i % lane.length],
              s.id,
              <Pic img={{ ...s, alt: "" }} sizes="16vw" imgClassName="h-auto w-full" />
            )
          )}
          {def.feature === "orbit" && place({ ...lane[4], width: "10vw" }, "orbit", <OrbitLoop />)}
        </div>

        {/* the held frame — z-10 puts it above the frames travelling behind
            (z-1) and below the ones passing in front (z-20) */}
        <div className="relative z-10 md:sticky md:top-0 md:flex md:h-svh md:items-center">
          <div className="grid w-full grid-cols-1 items-center gap-y-8 px-[var(--margin)] py-16 md:grid-cols-12 md:gap-x-[2.5vw] md:py-0">
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
              <Pic
                img={cover}
                sizes="(min-width: 768px) 64vw, calc(100vw - 2.5rem)"
                priority={index === 0}
                className="mx-auto transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:[filter:drop-shadow(0_0_60px_rgb(255_255_255/0.10))]"
                maxH="84svh"
                vtName={`frame-${def.slug}-${cover.id}`}
              />
            </div>

            {/* the plate — number, title, the lab slip, the colour bar */}
            <div
              className={`relative z-30 md:col-span-3 ${
                right ? "md:order-1 md:col-start-1" : "md:col-start-10"
              }`}
              style={{
                transform: "translate3d(calc(var(--px, 0) * 7px), calc(var(--py, 0) * 5px), 0)",
              }}
            >
              <FilmEdge set={set} />

              <div className="flex items-center gap-3">
                <span className="type-meta-sm text-mid">{nn}</span>
                <span className="plate-rule h-px flex-1 bg-hairline-strong" />
                <span className="type-meta-sm text-mid">
                  {def.kind === "commissioned" ? "commissioned" : "personal"}
                </span>
              </div>

              <h2 className="type-d2 set-title mt-4 text-hi">{def.title}</h2>

              <DataSlip
                rows={[
                  ["discipline", def.discipline],
                  ["shot", def.when],
                  ["frames", String(set.images.length)],
                ]}
              />

              <p className="type-body mt-6 max-w-[32ch] text-mid">{def.blurb}</p>
              {def.client && (
                <p className="type-meta-sm mt-4 text-low">for {def.client.name}</p>
              )}
              <PaletteStrip colors={palette} className="mt-7" />
              <p className="type-meta-sm mt-9 flex items-center gap-2 text-low transition-colors duration-[var(--duration-fast)] group-hover:text-hi">
                open set
                <span className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:translate-x-1">
                  →
                </span>
              </p>
            </div>
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

        <div className="relative z-10 flex min-h-[104svh] items-center justify-center px-[var(--margin)]">
          <div
            className="w-full max-w-[460px] text-center"
            style={{
              transform: "translate3d(calc(var(--px, 0) * 6px), calc(var(--py, 0) * 4px), 0)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="type-meta-sm text-mid">{nn}</span>
              <span className="plate-rule h-px flex-1 bg-hairline-strong" />
              <span className="type-meta-sm text-mid">sequence</span>
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
            <h2 className="type-d3 set-title mt-9 text-hi">{def.title}</h2>
            <p className="type-meta mt-3 text-mid">
              {set.images.length} frames · in order · {def.when}
            </p>
            <p className="type-body mx-auto mt-5 max-w-[34ch] text-mid">{def.blurb}</p>
            <p className="type-meta-sm mt-10 inline-flex items-center gap-2 text-low transition-colors duration-[var(--duration-fast)] group-hover:text-hi">
              enter
              <span className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:translate-x-1">
                →
              </span>
            </p>
          </div>
        </div>
      </PointerField>
    </Link>
  );
}
