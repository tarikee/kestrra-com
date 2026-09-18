"use client";

/**
 * The Gallery wall (DESIGN.md §8c).
 *
 * The wall itself is server-rendered and arrives as `children` — rows,
 * measures, alignments and every `<picture>` are computed in lib/gallery.ts
 * and app/gallery/page.tsx. This component owns only what a server cannot
 * know: where the hand is, what colour the room should be, how far down the
 * ramp you have scrolled, and which plate is open.
 *
 * That split is not tidiness. Handing 125 resolved images across the client
 * boundary as props serialises every thumbhash into the flight payload and
 * costs 1.3 MB of HTML before a single photograph loads. So the frames cross
 * as a slim list — no thumbhash, no srcset arrays, one pre-formatted rig line
 * — and the markup crosses as already-rendered children. Interaction is
 * delegated from the wall root, which is also simply the right way to wire
 * 125 frames: one listener, not two hundred and fifty.
 *
 * Everything that answers the pointer is light *around* a photograph. No
 * frame is ever dimmed, blurred or desaturated to make a neighbour stand out
 * — dimming is a grade change and the grade is not something a cursor gets
 * to touch. The scrim behind an open plate darkens the ground, never a frame.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ShareButton } from "@/components/export/share-button";
import { Link } from "next-view-transitions";
import { SheetLight } from "@/components/sheet-light";

/** everything the client needs and nothing it does not */
export interface SlimFrame {
  base: string;
  w: number;
  h: number;
  alt: string;
  /** set title, or the loose frame's context */
  context: string;
  slug: string | null;
  spill: string;
  /** pre-formatted, short form */
  rig: string | null;
}

export function GalleryWall({
  frames,
  children,
}: {
  frames: SlimFrame[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [spill, setSpill] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  // the room takes the colour of what you are standing in front of — the
  // pool's spill, already averaged at build time, drifting over --spill-drift.
  // Per pool, never per frame: §6 rejected per-frame sampling because
  // unrelated palettes made the room strobe, and it was right.
  useEffect(() => {
    if (hover === null) return;
    setSpill(frames[hover]?.spill ?? null);
  }, [hover, frames]);

  const indexFrom = useCallback((e: Event) => {
    const el = (e.target as HTMLElement | null)?.closest?.("[data-frame]");
    if (!el) return null;
    const n = Number((el as HTMLElement).dataset.frame);
    return Number.isFinite(n) ? n : null;
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onOver = (e: Event) => {
      const n = indexFrom(e);
      if (n !== null) setHover(n);
    };
    const onClick = (e: Event) => {
      const n = indexFrom(e);
      if (n !== null) setOpen(n);
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget || !el.contains(e.relatedTarget as Node)) setHover(null);
    };
    el.addEventListener("pointerover", onOver);
    el.addEventListener("focusin", onOver);
    el.addEventListener("click", onClick);
    el.addEventListener("pointerleave", onOut as EventListener);
    return () => {
      el.removeEventListener("pointerover", onOver);
      el.removeEventListener("focusin", onOver);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerleave", onOut as EventListener);
    };
  }, [indexFrom]);

  return (
    <div
      className="gallery-room"
      style={spill ? ({ ["--spill" as string]: spill } as React.CSSProperties) : undefined}
    >
      <ExposureRail />

      <SheetLight className="wall mt-[9svh]">
        <div ref={root}>{children}</div>
      </SheetLight>

      <ViewportLight root={root} onCentre={setHover} />

      <ReadingSlot frame={hover === null ? null : frames[hover] ?? null} />

      {open !== null && (
        <Plate frames={frames} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

/**
 * On a phone, the viewport is the light.
 *
 * The wall's whole idea is that the pointer is a light source and the frames
 * under it take more light. A phone has no pointer — so the first build
 * simply had none of it, along with no reading slot and no hue drift, which
 * is most of why the mobile page read as a camera roll. The honest
 * translation is not to drop the metaphor but to move it: the light is where
 * you are looking, and on a phone that is the middle of the screen. The frame
 * nearest the viewport's optical centre takes the light, and the ones above
 * and below it take less, exactly as they do beside the cursor on a desktop.
 *
 * Only runs where there is no fine pointer, so it never fights SheetLight.
 * Geometry is read only for frames the IntersectionObserver says are on
 * screen — a dozen at a time, not a hundred and twenty-five.
 */
function ViewportLight({
  root,
  onCentre,
}: {
  root: React.RefObject<HTMLDivElement | null>;
  onCentre: (n: number | null) => void;
}) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // the light is information here (it drives the reading slot and the room's
    // colour), so it still runs under reduced motion — only the lift does not
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frames = Array.from(el.querySelectorAll<HTMLElement>("[data-frame]"));
    if (!frames.length) return;

    const visible = new Set<HTMLElement>();
    const lit = new Set<HTMLElement>();
    let raf = 0;
    let last = -1;

    const read = () => {
      raf = 0;
      const centre = window.innerHeight * 0.45;
      const reach = window.innerHeight * 0.5;
      let best: HTMLElement | null = null;
      let bestD = Infinity;

      for (const f of visible) {
        const r = f.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - centre);
        if (d < bestD) {
          bestD = d;
          best = f;
        }
        if (!still) {
          const u = d >= reach ? 0 : 1 - d / reach;
          const v = Math.round(u * u * (3 - 2 * u) * 100) / 100;
          f.style.setProperty("--near", String(v));
          lit.add(f);
        }
      }
      // a frame that scrolled out keeps whatever it was last given unless it
      // is told otherwise
      for (const f of lit) {
        if (!visible.has(f)) {
          f.style.setProperty("--near", "0");
          lit.delete(f);
        }
      }

      const n = best ? Number(best.dataset.frame) : null;
      if (n !== last) {
        last = n ?? -1;
        onCentre(n);
      }
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target as HTMLElement);
          else visible.delete(e.target as HTMLElement);
        }
        wake();
      },
      { rootMargin: "20% 0px" }
    );
    frames.forEach((f) => io.observe(f));

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake, { passive: true });
    wake();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [root, onCentre]);

  return null;
}

/**
 * The exposure rail — the page's only chrome, and the one thing that states
 * the ordering without a sentence of copy. A hairline black-to-white scale in
 * the right margin with a marker at your position on the ramp. Zero chroma by
 * construction, which is the whole reason it is allowed to be here.
 */
function ExposureRail() {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = marker.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `translateY(${(p * 100).toFixed(2)}%)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="exposure-rail" aria-hidden="true">
      <span className="type-caption text-low">dark</span>
      <div className="exposure-rail-track">
        <div className="exposure-rail-scale" />
        <div ref={marker} className="exposure-rail-marker" />
      </div>
      <span className="type-caption text-low">light</span>
    </div>
  );
}

/**
 * One fixed reading position. A caption chasing the cursor across 125 frames
 * is the templated move, and it makes the whole wall twitch. This one never
 * moves — only the words in it change.
 */
function ReadingSlot({ frame }: { frame: SlimFrame | null }) {
  return (
    <div className="reading-slot" aria-hidden="true">
      <p className="type-meta text-mid" data-shown={frame ? "" : undefined}>
        {frame?.context ?? ""}
      </p>
      <p className="type-meta-sm mt-1 text-low" data-shown={frame?.rig ? "" : undefined}>
        {frame?.rig ?? ""}
      </p>
    </div>
  );
}

/**
 * The plate — the frame opened in place over the dimmed wall.
 *
 * Deliberately the same object as the Gora sequence's: mat, hairline, halo,
 * wall label. A print in a dark room is a print in a dark room, and the site
 * should only ever have one of them.
 */
function Plate({
  frames,
  index,
  onIndex,
  onClose,
}: {
  frames: SlimFrame[];
  index: number;
  onIndex: (n: number) => void;
  onClose: () => void;
}) {
  const frame = frames[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  const step = useCallback(
    (d: number) => {
      const next = index + d;
      if (next < 0 || next >= frames.length) return;
      onIndex(next);
    },
    [index, frames.length, onIndex]
  );

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // #main carries z-10 and so is a stacking context — a z-index on the
    // plate can never climb out of it to cover the fixed nav. The plate takes
    // the room the same way the sequence does instead, which is also simply
    // what it should do: nothing else is worth reading while a plate is open.
    document.body.dataset.plate = "true";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.plate;
    };
  }, [onClose, step]);

  // the next plate must be instant, same rule as the sequence
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const f = frames[i];
      if (!f) return;
      const el = new Image();
      el.src = `${f.base}/w1600.avif`;
    });
  }, [index, frames]);

  const ratio = frame.w / frame.h;

  return (
    <div
      className="plate-room"
      role="dialog"
      aria-modal="true"
      aria-label={`${frame.context} — frame ${index + 1} of ${frames.length}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="room-exit type-meta absolute left-[var(--margin)] top-6 z-40"
      >
        ← close
      </button>

      <div className="plate-stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="plate" style={{ ["--ratio" as string]: String(ratio) }}>
          <div className="plate-mat">
            <div className="plate-window">
              <picture key={frame.base} className="seq-develop absolute inset-0 block">
                <source
                  type="image/avif"
                  srcSet={`${frame.base}/w1080.avif 1080w, ${frame.base}/w1600.avif 1600w, ${frame.base}/w2200.avif 2200w`}
                  sizes="(min-width: 768px) 72vw, 92vw"
                />
                <img
                  src={`${frame.base}/w1920.webp`}
                  alt={frame.alt}
                  width={frame.w}
                  height={frame.h}
                  className="h-full w-full object-contain"
                />
              </picture>
            </div>
          </div>

          {/* docked to the plate, outside the print's top-right corner */}
          <ShareButton
            frame={{
              id: frame.base.split("/").pop() ?? "frame",
              base: frame.base,
              w: frame.w,
              h: frame.h,
              alt: frame.alt,
              rig: frame.rig,
              context: frame.context,
              position: `${String(index + 1).padStart(3, "0")} / ${frames.length}`,
              date: null,
            }}
          />

          <div key={`label-${frame.base}`} className="seq-label mt-[clamp(0.85rem,1.5vh,1.4rem)]">
            <div className="flex items-baseline justify-between gap-8">
              {frame.slug ? (
                <Link
                  href={`/work/${frame.slug}`}
                  className="type-meta t-color text-mid hover:text-hi"
                >
                  {frame.context} →
                </Link>
              ) : (
                <p className="type-meta text-mid">{frame.context}</p>
              )}
              <p className="type-meta-sm tabular-nums text-low">
                {String(index + 1).padStart(3, "0")} / {frames.length}
              </p>
            </div>
            <div className="seq-rig mt-[0.45rem]">
              <p className="type-meta-sm text-low">{frame.rig}</p>
            </div>
          </div>
        </div>
      </div>

      {/* the two steps, in the margins, at the lowest contrast that still
          reads — the keyboard is the real control */}
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={index === 0}
        aria-label="Previous frame"
        className="plate-step left-0"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={index === frames.length - 1}
        aria-label="Next frame"
        className="plate-step right-0"
      >
        →
      </button>
    </div>
  );
}
