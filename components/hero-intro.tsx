"use client";

/**
 * The hero — DESIGN.md §5, revised per Tarik: the mark lands clean and
 * still, and every couple of seconds the signal hiccups — a short glitch
 * burst that recovers within half a second. The mark is the light source
 * of the room: a breathing halo behind it, a second exposure hanging
 * deeper in the dark, and the whole scene lying in depth planes that
 * shift with the pointer — near frames move most, far frames sit soft.
 *
 * Six frames hang around the mark, each one a door into its set;
 * hovering names the collection.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import type { WorkImage } from "@/lib/work";
import { Pic } from "./pic";
import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX } from "./wordmark/wordmark-data";

const VB = WORDMARK_VIEWBOX.split(" ").map(Number);
const [VBX, VBY, VBW, VBH] = [VB[0], VB[1], VB[2], VB[3]];
const BANDS = 12;
const STEP = VBW / 90;

interface GlitchState {
  bands: number[];
  sep: number;
  jitter: number;
  dropout: number;
}

const CLEAN: GlitchState = { bands: new Array(BANDS).fill(0), sep: 0, jitter: 0, dropout: -1 };

/** one glitch pose at a given intensity — aggressive displacement, never shrapnel */
function glitchAt(intensity: number): GlitchState {
  const amp = intensity * intensity;
  const bands = Array.from({ length: BANDS }, () => {
    if (Math.random() > 0.28 + amp * 0.45) return 0;
    const spread = 1 + Math.floor(Math.random() * 6 * amp + amp * 2);
    return (Math.random() < 0.5 ? -1 : 1) * spread * STEP;
  });
  return {
    bands,
    sep: (1 + Math.floor(Math.random() * 3 * amp)) * STEP,
    jitter:
      Math.random() < 0.18 * amp
        ? (Math.random() < 0.5 ? -1 : 1) * STEP * (1 + Math.floor(Math.random() * 2))
        : 0,
    dropout: Math.random() < 0.3 * amp ? Math.floor(Math.random() * BANDS) : -1,
  };
}

// a burst: half a second of trouble, recovering
const BURST = [0.55, 0.42, 0.5, 0.3, 0.18, 0.08];
const TICK = 70;

export interface HeroTeaser {
  img: WorkImage;
  title: string;
  href: string;
}

// six frames around the mark in depth planes: `d` is the parallax rate
// (near planes move most), `far` frames sit behind the depth of field
const TEASER_POS = [
  { left: "5%", top: "10%", width: "15vw", d: 1.25, far: false },
  { right: "6%", top: "8%", width: "12vw", d: 0.9, far: false },
  { left: "2%", top: "40%", width: "9vw", d: 0.4, far: true },
  { right: "2%", top: "44%", width: "9vw", d: 0.45, far: true },
  { left: "9%", bottom: "9%", width: "13vw", d: 1.1, far: false },
  { right: "7%", bottom: "11%", width: "15vw", d: 1.4, far: false },
] as const;

export function HeroIntro({ teasers }: { teasers: HeroTeaser[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<GlitchState>(CLEAN);

  // the signal hiccups every couple of seconds while the hero is on screen
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let visible = true;

    const burst = (i: number) => {
      if (i >= BURST.length) {
        setState(CLEAN);
        schedule();
        return;
      }
      setState(glitchAt(BURST[i]));
      timer = setTimeout(() => burst(i + 1), TICK);
    };

    const schedule = () => {
      timer = setTimeout(() => {
        if (visible && !document.hidden) burst(0);
        else schedule();
      }, 1600 + Math.random() * 2100);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(section);
    schedule();

    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // pointer parallax — the scene has depth; layers ease, never glue to the cursor
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      section.style.setProperty("--hx", cx.toFixed(4));
      section.style.setProperty("--hy", cy.toFixed(4));
      raf =
        Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const glitching = state !== CLEAN;
  const bandH = VBH / BANDS;

  const teaserLink = (t: HeroTeaser, i: number, mobile: boolean) => {
    const pos = TEASER_POS[i % TEASER_POS.length];
    return (
      <Link
        key={t.href + t.img.id}
        href={t.href}
        aria-label={`View set: ${t.title}`}
        className="group absolute focus-visible:outline-offset-4"
        style={
          mobile
            ? {
                ...(i === 0 ? { left: "6%", top: "9%" } : { right: "6%", bottom: "9%" }),
                width: "38vw",
              }
            : {
                left: "left" in pos ? pos.left : undefined,
                right: "right" in pos ? pos.right : undefined,
                top: "top" in pos ? pos.top : undefined,
                bottom: "bottom" in pos ? pos.bottom : undefined,
                width: pos.width,
                transform: `translate3d(calc(var(--hx, 0) * ${pos.d} * 26px), calc(var(--hy, 0) * ${pos.d} * 17px), 0)`,
                filter: pos.far ? "blur(1.4px)" : undefined,
              }
        }
      >
        <div
          className="develop transition-transform duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:scale-[1.015]"
          style={{ animationDelay: `${180 + i * 130}ms` }}
        >
          <Pic
            img={{ ...t.img, alt: "" }}
            sizes={mobile ? "38vw" : "15vw"}
            imgClassName="h-auto w-full"
          />
          <p
            className={`type-meta-sm mt-2 text-mid ${
              mobile
                ? ""
                : "t-color translate-y-1 opacity-0 transition-[opacity,translate,color] duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-hi group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            }`}
          >
            {t.title} →
          </p>
        </div>
      </Link>
    );
  };

  return (
    <section ref={sectionRef} className="relative h-svh overflow-hidden" aria-label="Kestrra">
      {/* the work hangs around the still mark */}
      <div className="absolute inset-0 z-10 max-md:hidden">
        {teasers.slice(0, 6).map((t, i) => teaserLink(t, i, false))}
      </div>
      <div className="absolute inset-0 z-10 md:hidden">
        {teasers.slice(0, 2).map((t, i) => teaserLink(t, i, true))}
      </div>

      <div className="pointer-events-none relative z-20 flex h-full items-center justify-center px-[var(--margin)]">
        <h1 className="sr-only">Kestrra — photo, video, digital art</h1>
        <div
          className="relative w-[min(62vw,720px)]"
          style={{
            transform:
              "translate3d(calc(var(--hx, 0) * -18px), calc(var(--hy, 0) * -12px), 0)",
          }}
        >
          {/* the mark is the light source of the room — its halo breathes,
              and it stutters when the signal does */}
          <div className="hero-halo pointer-events-none absolute -inset-x-[30%] -inset-y-[340%]">
            <div
              className="h-full w-full"
              style={{
                background:
                  "radial-gradient(ellipse 52% 42% at 50% 50%, rgb(255 255 255 / 0.075), transparent 70%)",
                opacity: glitching ? 0.35 : 1,
                transition: "opacity 90ms linear",
              }}
            />
          </div>

          <svg
            viewBox={WORDMARK_VIEWBOX}
            className="relative z-[1] h-auto w-full text-hi"
            style={{ filter: "drop-shadow(0 0 30px rgb(255 255 255 / 0.12))" }}
            role="img"
            aria-label="Kestrra"
          >
            <defs>
              <g id="ki-mark">
                {WORDMARK_GLYPHS.map((g) => (
                  <path key={g.char + g.x} transform={`translate(${g.x} 0)`} d={g.d} />
                ))}
              </g>
              {glitching &&
                Array.from({ length: BANDS }, (_, b) => (
                  <clipPath id={`ki-band-${b}`} key={b}>
                    <rect
                      x={VBX - VBW * 0.1}
                      y={VBY + b * bandH}
                      width={VBW * 1.2}
                      height={bandH + 0.5}
                    />
                  </clipPath>
                ))}
            </defs>
            {!glitching ? (
              <use href="#ki-mark" fill="currentColor" />
            ) : (
              <g transform={`translate(${state.jitter} 0)`}>
                {([
                  ["#ff2a2a", -state.sep],
                  ["#2aff90", 0],
                  ["#2a6bff", state.sep],
                ] as const).map(([color, dx]) => (
                  <g key={color} style={{ mixBlendMode: "screen" }} fill={color}>
                    {Array.from({ length: BANDS }, (_, b) =>
                      state.dropout === b ? null : (
                        <g key={b} clipPath={`url(#ki-band-${b})`}>
                          <use href="#ki-mark" transform={`translate(${dx + state.bands[b]} 0)`} />
                        </g>
                      )
                    )}
                  </g>
                ))}
              </g>
            )}
          </svg>

          {/* second exposure — the mark's ghost hangs deeper in the room */}
          <svg
            viewBox={WORDMARK_VIEWBOX}
            className="absolute inset-0 z-0 h-auto w-full text-hi"
            style={{
              transform:
                "translate3d(calc(var(--hx, 0) * -34px), calc(var(--hy, 0) * -22px), 0) scale(1.9)",
              opacity: 0.045,
              filter: "blur(4px)",
            }}
            aria-hidden="true"
          >
            <use href="#ki-mark" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-baseline justify-between px-[var(--margin)] pb-7">
        <p className="type-meta-sm text-mid">Photo · Video · Digital Art</p>
        <p className="type-meta-sm scroll-hint text-low">scroll</p>
        <p className="type-meta-sm text-mid">Europe</p>
      </div>
    </section>
  );
}
