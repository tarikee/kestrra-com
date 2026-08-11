import { Link } from "next-view-transitions";
import type { WorkSet } from "@/lib/work";
import { Pic } from "./pic";
import { PaletteStrip } from "./palette-strip";
import { OrbitLoop } from "./orbit-loop";

/**
 * One set on the index — the windhover block (DESIGN.md §1).
 * The focal frame pins dead still while the block's extra height scrolls
 * the world past it. The world travels in three planes: a wash of the
 * set's own light furthest back, frames drifting slowly behind the focal
 * (soft, out of focus), and frames passing close in front of it, sharp
 * and fast. The overlap is what makes the depth real — the held frame is
 * inside the scene, not pasted on top of it.
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
  const [a, b, c] = [palette[0] ?? "#6a6a6a", palette[1] ?? palette[0] ?? "#5a5a5a", palette[2] ?? palette[0] ?? "#4a4a4a"];
  const near = right ? "72%" : "28%";
  const far = right ? "26%" : "74%";
  return (
    <div
      className="set-light pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
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
  );
}

export function IndexBlock({ set, index }: { set: WorkSet; index: number }) {
  const { def, cover, satellites, palette, spill } = set;
  const nn = String(index + 1).padStart(2, "0");
  const right = index % 2 === 0; // focal side alternates; 01 sits right
  const meta = [def.discipline, def.when, `${set.images.length} frames`].join(" · ");

  if (def.mode === "sequence") return <ThresholdBlock set={set} index={index} />;

  const lane = SAT_POS[right ? 0 : 1];

  const place = (pos: SatPos, key: string, children: React.ReactNode) => (
    <div
      key={key}
      className={`sat-drift develop-on-view absolute ${pos.front ? "z-20" : "z-[1]"}`}
      style={{
        top: pos.top,
        bottom: pos.bottom,
        left: pos.left,
        right: pos.right,
        width: pos.width,
        ["--drift" as string]: pos.drift,
      }}
    >
      <div
        style={
          pos.front
            ? undefined
            : { filter: "blur(2.2px)", transform: "scale(0.97)" }
        }
      >
        {children}
      </div>
    </div>
  );

  return (
    <Link
      href={`/work/${def.slug}`}
      data-spill={spill}
      className="group relative block focus-visible:outline-none"
      aria-label={`Open set: ${def.title} — ${meta}`}
    >
      {/* clip, not hidden — frames may bleed off the page edge without ever
          opening a horizontal scrollbar, and sticky still works */}
      <div className="relative overflow-x-clip md:h-[172svh]">
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
            >
              <Pic
                img={cover}
                sizes="(min-width: 768px) 64vw, calc(100vw - 2.5rem)"
                priority={index === 0}
                className="flex justify-center"
                imgClassName="h-auto w-auto max-w-full max-h-[84svh]"
                vtName={`frame-${def.slug}-${cover.id}`}
              />
            </div>

            <div
              className={`relative z-30 md:col-span-3 ${
                right ? "md:order-1 md:col-start-1" : "md:col-start-10"
              }`}
            >
              <p className="type-meta-sm text-low">{nn}</p>
              <h2 className="type-d2 mt-3 text-hi">{def.title}</h2>
              <p className="type-meta mt-4 text-mid">{meta}</p>
              <p className="type-body mt-5 max-w-[32ch] text-mid">{def.blurb}</p>
              {def.client && (
                <p className="type-meta-sm mt-5 text-low">for {def.client.name}</p>
              )}
              <PaletteStrip colors={palette} className="mt-8" />
              <p className="type-meta-sm mt-10 text-low transition-colors duration-[var(--duration-fast)] group-hover:text-hi">
                open set →
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Gora Polaroids — its own entry point, apart from the row of commissioned
 * work (§8). A threshold, not a card: one small still frame, more space than
 * anything else on the page, and threshold language.
 */
function ThresholdBlock({ set, index }: { set: WorkSet; index: number }) {
  const { def, cover, spill } = set;
  return (
    <Link
      href={`/work/${def.slug}`}
      data-spill={spill}
      className="group block focus-visible:outline-none"
      aria-label={`Enter the sequence: ${def.title} — ${set.images.length} frames, in order`}
    >
      <div className="flex min-h-[140svh] items-center justify-center px-[var(--margin)]">
        <div className="w-full max-w-[460px] text-center">
          <p className="type-meta-sm text-low">{String(index + 1).padStart(2, "0")}</p>
          <div className="develop-on-view mt-10">
            <Pic
              img={cover}
              sizes="(min-width: 768px) 460px, 86vw"
              imgClassName="h-auto w-full"
              vtName={`frame-${def.slug}-${cover.id}`}
            />
          </div>
          <h2 className="type-d3 mt-10 text-hi">{def.title}</h2>
          <p className="type-meta mt-3 text-mid">
            {set.images.length} frames · in order · {def.when}
          </p>
          <p className="type-meta-sm mt-12 text-low transition-colors duration-[var(--duration-fast)] group-hover:text-hi">
            enter →
          </p>
        </div>
      </div>
    </Link>
  );
}
