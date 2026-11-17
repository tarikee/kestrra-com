"use client";

/**
 * The music videos' grade, shown before and after (components/film-row.tsx,
 * the home page's film section).
 *
 * The camera files were not kept, so "before" is a log view rebuilt from the
 * graded frame, never the original footage; the pages say so in a caption.
 *
 * Compare — the log view over the grade, at the same size, split by one
 * hairline. The pointer drags it (a press anywhere puts it there), a finger
 * drags it sideways and still scrolls the page up and down, and a real range
 * input carries it for the keyboard and screen readers. It starts at the
 * middle; the first time it is on screen the line moves once, a little each
 * way, so it reads as something to take hold of. Never under reduced motion.
 *
 * FilmPlayer holds a row's one bit of state, whether its video is playing,
 * so the play button in the plate and the screen beside it agree. Nothing is
 * asked of YouTube before the click; starting one video stops any other.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { WorkImage } from "@/lib/work";
import type { FilmFrame, FilmStill } from "@/lib/film";
import { Pic } from "./pic";
import { MetaLight } from "./letter-light";
import { lenis, jumpTo } from "./smooth-scroll";

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** the one-time sweep: how far the line travels each way, and for how long */
const SWEEP = 12;
const SWEEP_MS = 1700;

export function Compare({
  still,
  name,
  sizes,
  priority = false,
  className = "",
}: {
  still: FilmStill;
  /** "Mahrina — Bubili" */
  name: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [at, setAt] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  /** once the visitor has taken hold of it, nothing moves it on its own */
  const touched = useRef(false);
  const sweep = useRef<number | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; touch: boolean; moved: boolean } | null>(
    null
  );

  const stopSweep = () => {
    if (sweep.current !== null) cancelAnimationFrame(sweep.current);
    sweep.current = null;
  };

  const fromX = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0) return 50;
    return clamp(((clientX - r.left) / r.width) * 100);
  };

  // the sweep, once, the first time most of it is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || e.intersectionRatio < 0.6) return;
        io.disconnect();
        if (touched.current) return;
        const t0 = performance.now();
        const tick = (now: number) => {
          if (touched.current) return stopSweep();
          const u = Math.min(1, (now - t0) / SWEEP_MS);
          // out to one side, across, and home: one slow sine, eased at both ends
          const ease = u * u * (3 - 2 * u);
          setAt(50 - SWEEP * Math.sin(ease * Math.PI * 2));
          sweep.current = u < 1 ? requestAnimationFrame(tick) : null;
        };
        sweep.current = requestAnimationFrame(tick);
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stopSweep();
    };
  }, []);

  const take = () => {
    touched.current = true;
    stopSweep();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    take();
    const touch = e.pointerType === "touch";
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, touch, moved: false };
    if (touch) return; // a finger may be on its way to scrolling: wait and see
    // a press puts the line where it lands, and keeps the text around it
    // from being selected while it is dragged
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setAt(fromX(e.clientX));
    // so the arrow keys carry on from here
    input.current?.focus({ preventScroll: true });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.touch && !d.moved) {
      // sideways is ours; up and down is the page's (touch-action: pan-y
      // hands a vertical pan to the browser, which cancels this pointer)
      if (Math.abs(e.clientX - d.x) < 4) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setAt(fromX(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // a tap moves the line to it
    if (d.touch && !d.moved) setAt(fromX(e.clientX));
    drag.current = null;
  };

  const end = () => {
    drag.current = null;
  };

  const n = Math.round(at);

  return (
    <div
      ref={ref}
      className={`film-compare ${className}`}
      style={
        {
          aspectRatio: `${still.grade.w} / ${still.grade.h}`,
          "--at": `${at}%`,
        } as React.CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={end}
      // a touch is first captured by the image under the finger; that capture
      // handing over to this box must not end the drag, only its release can
      onLostPointerCapture={(e) => e.target === e.currentTarget && end()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* both views develop in together when the frame changes */}
      <div key={still.grade.id} className="film-compare-pair develop">
        <Frame img={still.grade} sizes={sizes} priority={priority} className="film-compare-grade" />
        <Frame img={still.log} sizes={sizes} priority={priority} className="film-compare-log" />
      </div>
      <span className="film-compare-line" aria-hidden="true" />
      <input
        ref={input}
        type="range"
        min={0}
        max={100}
        step={5}
        value={n}
        onChange={(e) => {
          take();
          setAt(clamp(Number(e.currentTarget.value)));
        }}
        className="film-compare-range"
        aria-label={`Log view and grade, ${name}`}
        aria-valuetext={`${n}% log view, ${100 - n}% grade`}
      />
    </div>
  );
}

function Frame({
  img,
  sizes,
  priority,
  className,
}: {
  img: FilmFrame;
  sizes: string;
  priority: boolean;
  className: string;
}) {
  return (
    <div className={className}>
      <Pic
        img={img as WorkImage}
        sizes={sizes}
        priority={priority}
        placeholder={img.thumb ? "thumbhash" : "dominant"}
        className="block h-full w-full"
        imgClassName="block h-full w-full object-contain"
      />
    </div>
  );
}

/** the two sides, named under the frame: never laid over the picture */
export function CompareLabels({ className = "" }: { className?: string }) {
  return (
    <MetaLight className={`flex items-baseline justify-between ${className}`}>
      <span className="type-meta-sm text-low" data-lit>
        log
      </span>
      <span className="type-meta-sm text-low" data-lit>
        grade
      </span>
    </MetaLight>
  );
}

/* ── one row's player ──────────────────────────────────────────────────── */

type Player = { playing: boolean; play: () => void; stop: () => void };
const PlayerContext = createContext<Player | null>(null);

const EVENT = "kestrra:film-play";

export function FilmPlayer({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);

  // starting one video stops the rest
  useEffect(() => {
    const onPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== slug) setPlaying(false);
    };
    window.addEventListener(EVENT, onPlay);
    return () => window.removeEventListener(EVENT, onPlay);
  }, [slug]);

  const play = useCallback(() => {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: slug }));
    setPlaying(true);
  }, [slug]);
  const stop = useCallback(() => setPlaying(false), []);

  return (
    <PlayerContext.Provider value={{ playing, play, stop }}>{children}</PlayerContext.Provider>
  );
}

function usePlayer(): Player {
  const p = useContext(PlayerContext);
  if (!p) throw new Error("FilmPlayer missing");
  return p;
}

/**
 * The media column of a row: the compare and its labels, or, once play is
 * pressed, the video itself at 16:9; under it, the rest of its stills, whole.
 * A still pressed takes the compare's place (each has its log view too).
 */
export function FilmScreen({
  stills,
  name,
  youtube,
  sizes,
  priority = false,
}: {
  stills: FilmStill[];
  name: string;
  youtube: string;
  sizes: string;
  priority?: boolean;
}) {
  const { playing, stop } = usePlayer();
  const [lead, setLead] = useState(0);
  const video = useRef<HTMLDivElement>(null);

  // the play button can sit below the screen on a phone: bring the video to
  // the eye once it starts, unless it is already wholly in view
  useEffect(() => {
    const el = video.current;
    if (!playing || !el) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight) return;
    const l = lenis();
    if (l) l.scrollTo(el, { offset: -96 });
    else jumpTo(el);
  }, [playing]);
  const others = stills.map((s, i) => ({ s, i })).filter(({ i }) => i !== lead);

  return (
    <div className="w-full">
      {playing ? (
        <div ref={video} className="film-video develop">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1`}
            title={`${name}, on YouTube`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            className="block h-full w-full border-0"
          />
        </div>
      ) : (
        <>
          <Compare
            still={stills[lead]}
            name={name}
            sizes={sizes}
            priority={priority}
            className="transition-[filter] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] group-hover:[filter:drop-shadow(0_0_60px_rgb(255_255_255/0.10))]"
          />
          <CompareLabels className="mt-3" />
        </>
      )}

      {others.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 md:w-1/2 md:gap-[1.25vw]" role="group" aria-label={`More stills, ${name}`}>
          {others.map(({ s, i }) => (
            <button
              key={s.grade.id}
              type="button"
              className="film-still"
              aria-label={`Compare this still, ${name}`}
              onClick={() => {
                stop();
                setLead(i);
              }}
            >
              <Pic
                img={s.grade as WorkImage}
                sizes="(min-width: 768px) 16vw, 45vw"
                placeholder="dominant"
                className="block"
                imgClassName="block h-auto w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** play, in the plate; stop, once it is playing */
export function PlayButton({ name }: { name: string }) {
  const { playing, play, stop } = usePlayer();
  return (
    <button
      type="button"
      className="btn"
      onClick={playing ? stop : play}
      aria-label={playing ? `Stop ${name}` : `Play ${name}`}
    >
      <span className="btn-label">{playing ? "stop" : "play"}</span>
      <span className="btn-arrow" aria-hidden="true">
        {/* U+FE0E keeps the triangle a glyph, never an emoji */}
        <span>{playing ? "■" : "▶︎"}</span>
      </span>
    </button>
  );
}
