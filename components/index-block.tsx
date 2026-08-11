import { Link } from "next-view-transitions";
import type { WorkSet } from "@/lib/work";
import { Pic } from "./pic";
import { PaletteStrip } from "./palette-strip";
import { OrbitLoop } from "./orbit-loop";

/**
 * One set on the index — the windhover block (DESIGN.md §1).
 * The focal frame pins dead still while the block's extra height scrolls
 * satellites and the rest of the world past it. Nothing slides on its own;
 * frames develop in as they enter (§6).
 */

// Deterministic satellite placements. Satellites share the focal frame's
// half of the grid and sit behind it (z-0 vs z-10), so they surface above
// and below the still centre as they travel — and never cross the type.
// Five slots per side in two depth planes: near slots drift hard and stay
// sharp; far slots barely move and sit behind the depth of field.
// A set's `feature: "orbit"` loop takes the last slot.
const SAT_POS = [
  // focal right → satellites right
  [
    { top: "2%", left: "46%", width: "14vw", drift: "8vh", far: false },
    { top: "20%", right: "2%", width: "10vw", drift: "-3vh", far: true },
    { top: "42%", left: "50%", width: "12vw", drift: "7vh", far: false },
    { top: "64%", right: "4%", width: "11vw", drift: "-2.5vh", far: true },
    { top: "84%", left: "54%", width: "13vw", drift: "6vh", far: false },
  ],
  // focal left → satellites left
  [
    { top: "3%", right: "48%", width: "13vw", drift: "-8vh", far: false },
    { top: "21%", left: "2%", width: "10vw", drift: "2.5vh", far: true },
    { top: "43%", right: "52%", width: "12vw", drift: "-7vh", far: false },
    { top: "65%", left: "4%", width: "11vw", drift: "3vh", far: true },
    { top: "85%", right: "50%", width: "14vw", drift: "-6vh", far: false },
  ],
] as const;

export function IndexBlock({ set, index }: { set: WorkSet; index: number }) {
  const { def, cover, satellites, palette, spill } = set;
  const nn = String(index + 1).padStart(2, "0");
  const right = index % 2 === 0; // focal side alternates; 01 sits right
  const meta = [def.discipline, def.when, `${set.images.length} frames`].join(" · ");

  if (def.mode === "sequence") return <ThresholdBlock set={set} index={index} />;

  return (
    <Link
      href={`/work/${def.slug}`}
      data-spill={spill}
      className="group relative block focus-visible:outline-none"
      aria-label={`Open set: ${def.title} — ${meta}`}
    >
      <div className="relative md:h-[165svh]">
        {/* satellites — the world that moves past the still centre */}
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
          {satellites.map((s, i) => {
            const pos = SAT_POS[right ? 0 : 1][i % 5];
            return (
              <div
                key={s.id}
                className="sat-drift develop-on-view absolute"
                style={{
                  top: pos.top,
                  left: "left" in pos ? pos.left : undefined,
                  right: "right" in pos ? pos.right : undefined,
                  width: pos.width,
                  ["--drift" as string]: pos.drift,
                }}
              >
                <div style={pos.far ? { filter: "blur(1.3px)" } : undefined}>
                  <Pic img={{ ...s, alt: "" }} sizes="16vw" imgClassName="h-auto w-full" />
                </div>
              </div>
            );
          })}
          {def.feature === "orbit" && (
            <div
              className="sat-drift develop-on-view absolute"
              style={(() => {
                const pos = SAT_POS[right ? 0 : 1][4];
                return {
                  top: pos.top,
                  left: "left" in pos ? pos.left : undefined,
                  right: "right" in pos ? pos.right : undefined,
                  width: "10.5vw",
                  ["--drift" as string]: pos.drift,
                };
              })()}
            >
              <OrbitLoop />
            </div>
          )}
        </div>

        {/* the held frame */}
        <div className="md:sticky md:top-0 md:flex md:h-svh md:items-center">
          <div className="grid w-full grid-cols-1 items-center gap-y-8 px-[var(--margin)] py-16 md:grid-cols-12 md:gap-x-[2.5vw] md:py-0">
            <div
              className={`relative z-10 md:col-span-7 ${
                right ? "md:order-2 md:col-start-6" : "md:col-start-1"
              }`}
            >
              <Pic
                img={cover}
                sizes="(min-width: 768px) 56vw, calc(100vw - 2.5rem)"
                priority={index === 0}
                className="flex justify-center"
                imgClassName="h-auto w-auto max-w-full max-h-[76svh]"
                vtName={`frame-${def.slug}-${cover.id}`}
              />
            </div>

            <div
              className={`relative z-10 md:col-span-4 ${
                right ? "md:order-1 md:col-start-1" : "md:col-start-9"
              }`}
            >
              <p className="type-meta-sm text-low">{nn}</p>
              <h2 className="type-d2 mt-3 text-hi">{def.title}</h2>
              <p className="type-meta mt-4 text-mid">{meta}</p>
              <p className="type-body mt-5 max-w-[38ch] text-mid">{def.blurb}</p>
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
