"use client";

/**
 * The hero: one frame at a time coming out of the smoke. A photograph is not
 * a rectangle laid over the room. Its edges dissolve into the living ground,
 * and the section carries the spill of the frame on screen, so the smoke
 * around it takes the colour of the picture. The words sit on the bare ground
 * at the left, where nothing has to be darkened for them to read.
 *
 * Each frame holds, then gives way to the next, slowly, and its caption opens
 * the set it came from. Anyone looking stops the clock (a pointer on the
 * frame, keyboard focus on the controls), and so does a hidden tab or a page
 * scrolled past. With reduced motion nothing moves on its own.
 *
 * A frame is a slot: any image plus the point its crop must keep. A studio
 * portrait shot on black, lit from high left like the room, drops straight in.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import type { WorkImage } from "@/lib/work";
import { CraftSwitch } from "@/components/craft-switch";
import { Pic } from "./pic";
import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX } from "./wordmark/wordmark-data";
import styles from "./hero-frame.module.css";

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

/** one glitch pose at a given intensity: aggressive displacement, never shrapnel */
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

/** the mark, clean and still, with the signal hiccuping every couple of seconds */
function GlitchMark({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<GlitchState>(CLEAN);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

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
    io.observe(el);
    schedule();

    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const glitching = state !== CLEAN;
  const bandH = VBH / BANDS;

  return (
    <svg ref={ref} viewBox={WORDMARK_VIEWBOX} className={className} role="img" aria-label="Kestrra">
      <defs>
        <g id="kf-mark">
          {WORDMARK_GLYPHS.map((g) => (
            <path key={g.char + g.x} transform={`translate(${g.x} 0)`} d={g.d} />
          ))}
        </g>
        {glitching &&
          Array.from({ length: BANDS }, (_, b) => (
            <clipPath id={`kf-band-${b}`} key={b}>
              <rect x={VBX - VBW * 0.1} y={VBY + b * bandH} width={VBW * 1.2} height={bandH + 0.5} />
            </clipPath>
          ))}
      </defs>
      {!glitching ? (
        <use href="#kf-mark" fill="currentColor" />
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
                  <g key={b} clipPath={`url(#kf-band-${b})`}>
                    <use href="#kf-mark" transform={`translate(${dx + state.bands[b]} 0)`} />
                  </g>
                )
              )}
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export interface HeroSlide {
  img: WorkImage;
  /** the point, in percent of the image, that every crop keeps in view */
  focus: { x: number; y: number };
  /** the same for the desktop crop, when it differs */
  wide?: { x: number; y: number };
  /** where, in percent of the desktop frame's width, the picture is fully out of the smoke */
  fade?: number;
  title: string;
  /** the full set; without one the caption is just the title */
  href?: string;
  spill: string;
}

/** how long a frame holds before it gives way */
const HOLD = 7000;

const pad = (v: number) => String(v).padStart(2, "0");

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 10 10"
      width="10"
      height="10"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
    >
      <path d={dir === "prev" ? "M6.5 1.5 3 5l3.5 3.5" : "M3.5 1.5 7 5 3.5 8.5"} />
    </svg>
  );
}

function PauseIcon({ held }: { held: boolean }) {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="currentColor">
      {held ? (
        <path d="M2.5 1.5v7l6-3.5z" />
      ) : (
        <>
          <rect x="2" y="1.5" width="2" height="7" />
          <rect x="6" y="1.5" width="2" height="7" />
        </>
      )}
    </svg>
  );
}

export function HeroFrame({ slides }: { slides: HeroSlide[] }) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  // frames in the page: the first, then each one a turn before it is due
  const [mounted, setMounted] = useState<number[]>([0]);
  const [firstIn, setFirstIn] = useState(false);
  const [held, setHeld] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [inView, setInView] = useState(true);
  const [still, setStill] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  const ratio = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // no pause on hover: the hero fills the screen, so the pointer is nearly always on it.
  // The pause button, keyboard focus, a hidden tab or scrolling away stop it.
  const running = n > 1 && !still && !held && !focused && !hidden && inView;
  const slide = slides[index];
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  // how much of the hero is on screen, the tab, the motion preference
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        ratio.current = e.intersectionRatio;
        setInView(e.intersectionRatio > 0.35);
      },
      { threshold: [0, 0.35, 0.6, 1] }
    );
    io.observe(el);
    const onVis = () => setHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setStill(mq.matches);
    onMotion();
    mq.addEventListener("change", onMotion);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onMotion);
    };
  }, []);

  // nothing else is fetched until the first frame is in
  useEffect(() => {
    const img = firstRef.current?.querySelector("img");
    if (!img || img.complete) {
      setFirstIn(true);
      return;
    }
    const done = () => setFirstIn(true);
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    return () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
    };
  }, []);

  useEffect(() => {
    const want = firstIn ? [index, (index + 1) % n] : [index];
    setMounted((m) => (want.every((i) => m.includes(i)) ? m : [...new Set([...m, ...want])]));
  }, [firstIn, index, n]);

  // the room follows the frame while the hero holds the screen; scrolled
  // away, the spill driver hands it to the next set as usual
  useEffect(() => {
    if (ratio.current >= 0.6) document.documentElement.style.setProperty("--spill", slide.spill);
  }, [slide.spill]);

  return (
    <section ref={sectionRef} data-spill={slide.spill} aria-label="Kestrra" className={styles.hero}>
      <div
        className={styles.frame}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const from = touch.current;
          touch.current = null;
          if (!from || n < 2) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - from.x;
          const dy = t.clientY - from.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        {slides.map((s, i) => {
          const on = i === index;
          const wide = s.wide ?? s.focus;
          return (
            <div
              key={s.img.base}
              ref={i === 0 ? firstRef : undefined}
              className={styles.slide}
              data-on={on ? "" : undefined}
              aria-hidden={on ? undefined : true}
              style={
                {
                  "--fx": `${s.focus.x}%`,
                  "--fy": `${s.focus.y}%`,
                  "--wx": `${wide.x}%`,
                  "--wy": `${wide.y}%`,
                  "--fade": `${s.fade ?? 62}%`,
                } as React.CSSProperties
              }
            >
              {mounted.includes(i) && (
                <Pic
                  img={s.img}
                  priority={i === 0}
                  placeholder={i === 0 ? "thumbhash" : "dominant"}
                  sizes="(min-width: 768px) 72vw, 100vw"
                  className={i === 0 ? "develop block h-full w-full" : "block h-full w-full"}
                  imgClassName="h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
        {/* the picture itself opens its set too; the caption's button is the
            one keyboards and screen readers get */}
        {slide.href && (
          <Link href={slide.href} tabIndex={-1} aria-hidden="true" className={styles.hit} />
        )}
      </div>

      <div className={styles.words}>
        <CraftSwitch current="photo" className="mb-6" />
        <h1 className="m-0">
          <GlitchMark className="h-auto w-[min(80vw,36rem)] text-hi" />
        </h1>
        <p className="type-meta mt-5 text-mid">photo · film · development</p>
        <p className="type-lead mt-3 max-w-[28ch] text-balance text-hi">
          Photography and film for events, people and the stage.
        </p>
        <p className="type-body mt-2 max-w-[38ch] text-mid">
          Based in Serbia, working across Europe.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/inquiry" className="btn">
            <span className="btn-label">write to me</span>
            <span className="btn-arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </Link>
          <span className="flex flex-wrap gap-x-7 gap-y-3">
            <a href="#work" className="dev-link t-color type-meta">
              photo ↓
            </a>
            <Link href="/dev" className="dev-link t-color type-meta">
              development →
            </Link>
          </span>
        </div>
      </div>

      <div
        className={styles.rail}
        role="group"
        aria-label="Selected work"
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) setFocused(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        onKeyDown={(e) => {
          if (n < 2 || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
          e.preventDefault();
          go(index + (e.key === "ArrowRight" ? 1 : -1));
        }}
      >
        {n > 1 && (
          <>
            <div className={styles.ticks}>
              {slides.map((s, i) => (
                <button
                  key={s.img.base}
                  type="button"
                  className={styles.tick}
                  aria-label={`${s.title}, frame ${i + 1} of ${n}`}
                  aria-current={i === index ? "true" : undefined}
                  data-done={i < index ? "" : undefined}
                  onClick={() => go(i)}
                >
                  {i === index && (
                    <span
                      className={styles.fill}
                      data-run={running ? "" : undefined}
                      style={{ animationDuration: `${HOLD}ms` }}
                      onAnimationEnd={(e) => {
                        if (e.target === e.currentTarget && running) go(index + 1);
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className={styles.controls}>
              <button type="button" className={styles.icon} aria-label="Previous frame" onClick={() => go(index - 1)}>
                <Chevron dir="prev" />
              </button>
              {!still && (
                <button
                  type="button"
                  className={styles.icon}
                  aria-label={held ? "Play the frames" : "Pause the frames"}
                  onClick={() => setHeld((h) => !h)}
                >
                  <PauseIcon held={held} />
                </button>
              )}
              <button type="button" className={styles.icon} aria-label="Next frame" onClick={() => go(index + 1)}>
                <Chevron dir="next" />
              </button>
            </div>
            <p className={`${styles.count} type-meta-sm text-mid`} aria-hidden="true">
              {pad(index + 1)} / {pad(n)}
            </p>
          </>
        )}

        <p className={`${styles.title} type-body text-hi`} aria-live={running ? "off" : "polite"}>
          <span key={index} className="develop inline-block">
            {slide.title}
          </span>
        </p>
        {slide.href && (
          <Link href={slide.href} aria-label={`Open set: ${slide.title}`} className={`${styles.open} type-meta`}>
            open set
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
