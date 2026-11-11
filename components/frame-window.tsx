"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { WorkImage } from "@/lib/work";
import { Pic } from "./pic";

/** what one frame needs to be drawn — nothing more crosses to the client */
export type WindowFrame = Pick<
  WorkImage,
  "id" | "w" | "h" | "avif" | "webp" | "base" | "thumb" | "dominant" | "alt"
> & {
  /** the point, in percent of the image, that the window's crop keeps */
  focus?: { x: number; y: number };
};

/** how long a frame holds before the next develops in */
const PERIOD = 4500;
/** spreads the rows' turns around the clock so no two change together */
const GOLDEN = 0.6180339887;

type Step = { at: number; prev: number | null; moved: boolean };

/**
 * A set's frames, one at a time, in a window of the cover's shape: the
 * cover, then the set's picks, looping. It turns on its own only while at
 * least half of it is on screen, and never under reduced motion; the two
 * arrows step it by hand and restart the wait.
 *
 * Every row keeps one clock: its turns fall on a fixed phase, offset by its
 * index, so rows on screen together never change in the same moment.
 */
export function FrameWindow({
  frames,
  title,
  index,
  sizes,
  maxH,
  priority = false,
  vtPrefix,
  className = "",
}: {
  frames: WindowFrame[];
  /** the set's name, for the arrows' labels */
  title: string;
  index: number;
  sizes: string;
  maxH: string;
  priority?: boolean;
  /** shared-element name prefix; the frame on show carries `${prefix}-${id}` */
  vtPrefix: string;
  className?: string;
}) {
  const n = frames.length;
  const [s, step] = useReducer(
    (s: Step, d: number): Step => {
      const at = (((s.at + d) % n) + n) % n;
      return at === s.at ? s : { at, prev: s.at, moved: true };
    },
    { at: 0, prev: null, moved: false }
  );
  // in the page: the cover and the next one, then each a turn before it is due
  const [mounted, setMounted] = useState<number[]>(n > 1 ? [0, 1] : [0]);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  /** the least wait before the next turn: a hand step buys a whole period */
  const lead = useRef(1000);

  const running = n > 1 && inView && !still && !hidden;
  const { w, h } = frames[0];

  useEffect(() => {
    const el = ref.current;
    if (!el || n < 2) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio >= 0.5),
      { threshold: [0, 0.5, 1] }
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
  }, [n]);

  // the next turn, on this row's phase of the shared clock
  useEffect(() => {
    if (!running) return;
    const phase = ((index * GOLDEN) % 1) * PERIOD;
    const now = Date.now();
    const slot = Math.ceil((now + lead.current - phase) / PERIOD) * PERIOD + phase;
    lead.current = 1000;
    const t = window.setTimeout(() => {
      lead.current = PERIOD / 2;
      step(1);
    }, slot - now);
    return () => window.clearTimeout(t);
  }, [running, s.at, index]);

  // keep the next frame loaded ahead of its turn
  useEffect(() => {
    const want = [s.at, (s.at + 1) % n];
    setMounted((m) => (want.every((i) => m.includes(i)) ? m : [...new Set([...m, ...want])]));
  }, [s.at, n]);

  const byHand = (d: number) => (e: React.MouseEvent) => {
    // the arrows live inside the row's link: they must never open the set
    e.preventDefault();
    e.stopPropagation();
    lead.current = PERIOD;
    if (d < 0) setMounted((m) => (m.includes((s.at - 1 + n) % n) ? m : [...m, (s.at - 1 + n) % n]));
    step(d);
  };
  // reaching for the arrows fetches the frame behind as well
  const warm = () => {
    const back = (s.at - 1 + n) % n;
    setMounted((m) => (m.includes(back) ? m : [...m, back]));
  };

  return (
    <div className="mx-auto" style={{ width: `min(100%, calc(${maxH} * ${w} / ${h}))` }}>
      <div ref={ref} className={`set-window ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
        {frames.map((f, i) => {
          const on = i === s.at;
          return (
            <div
              key={f.base}
              className="set-window-frame"
              data-on={on ? "" : undefined}
              data-was={i === s.prev ? "" : undefined}
              data-moved={s.moved ? "" : undefined}
              aria-hidden={on ? undefined : true}
              style={
                f.focus
                  ? ({ "--fx": `${f.focus.x}%`, "--fy": `${f.focus.y}%` } as React.CSSProperties)
                  : undefined
              }
            >
              {mounted.includes(i) && (
                <Pic
                  img={f as WorkImage}
                  sizes={sizes}
                  priority={priority && i === 0}
                  placeholder={i === 0 ? "thumbhash" : "dominant"}
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  vtName={on ? `${vtPrefix}-${f.id}` : undefined}
                />
              )}
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div
          className="set-window-steps type-meta-sm text-mid"
          role="group"
          aria-label={`Frames of ${title}`}
          onPointerEnter={warm}
          onFocus={warm}
        >
          <button
            type="button"
            className="set-window-step t-color hover:text-hi"
            aria-label={`previous frame, ${title}`}
            onClick={byHand(-1)}
          >
            ‹
          </button>
          <span className="set-window-count">
            {s.at + 1} / {n}
          </span>
          <button
            type="button"
            className="set-window-step t-color hover:text-hi"
            aria-label={`next frame, ${title}`}
            onClick={byHand(1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
