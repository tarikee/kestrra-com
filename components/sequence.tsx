"use client";

/**
 * Sequence mode — built for Gora Polaroids (DESIGN.md §8).
 *
 * One frame at a time, ordered, deliberate. Entry is a threshold the visitor
 * crosses on purpose. Frames advance by discrete intent — keys, click zones,
 * swipe — never free scrolling, never a timer. Transitions are exposure
 * events: the light goes out of one frame, holds, and develops into the
 * next. This set alone is permitted to retime the global motion tokens
 * (scoped in globals.css, still derived from the scale). The ending holds;
 * nothing is offered for a beat; then one quiet way out appears.
 *
 * ── Revision 7 — the print, not the projection ──────────────────────────
 *
 * The first build gave each frame 86vw × 74svh, which was the opposite of
 * what §8 asks for ("more space than anywhere else"), and it cost the set
 * its subject. These twelve exposures carry a heavy burned-in vignette: at
 * full bleed their edges dissolve straight into a near-black ground, so the
 * picture had no edge, and a picture with no edge is a wallpaper. Tarkovsky's
 * Instant Light plates are small things on a large page — you lean toward
 * them. So does this now:
 *
 *   · the print is ~58svh, sat on a mat a few percent above the ground, with
 *     a hairline at its outer edge. That is the whole trick — the vignette
 *     now ends *somewhere*, and the image becomes an object in a dark room.
 *   · the mat takes light from the pointer (shared `--near` driver, the same
 *     one the contact sheets use). The plate never moves; it only ever takes
 *     more light. Nothing touches the photograph.
 *   · the room's fog leans with the pointer too — a compositor transform on
 *     the spill, a few vw at most. The light changes; nothing moves.
 *   · the twelve authored beats and the frame's settings print as a wall
 *     label under the plate, after the image has landed alone. They were
 *     written into content/sets.ts on day one and had never once rendered.
 *   · breathing frames (§8's car interiors) develop slower and hold their
 *     label back — the pulse is in the timing, not in a device.
 *
 * Still forbidden here and absent on purpose: music, progress bars,
 * thumbnails, autoplay, timed advance, any grade shift.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import type { WorkSet } from "@/lib/work";
import { exifLine, shootMonth } from "@/lib/exif";
import { SheetLight } from "@/components/sheet-light";
import { onPointer } from "@/lib/pointer";
import { ShareButton } from "@/components/export/share-button";

type Phase = "threshold" | "frames" | "end";

/** input lock per advance — long enough that nothing queues, short enough
    that the room never feels unresponsive. The *transition* is longer. */
const SETTLE = 1100;
const SETTLE_REDUCED = 150;

export function Sequence({
  set,
  initialId,
}: {
  set: WorkSet;
  initialId?: string;
}) {
  const router = useTransitionRouter();
  const images = set.images;
  const startIdx = initialId ? Math.max(0, images.findIndex((i) => i.id === initialId)) : 0;

  const [phase, setPhase] = useState<Phase>(initialId ? "frames" : "threshold");
  const [idx, setIdx] = useState(startIdx);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [endReady, setEndReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const busy = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const url = useCallback(
    (i: number | null) =>
      i === null ? `/work/${set.def.slug}` : `/work/${set.def.slug}/${images[i].id}`,
    [set.def.slug, images]
  );

  // the sequence owns the room: no nav, no footer, no scroll behind it
  useEffect(() => {
    document.body.dataset.sequence = "true";
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      delete document.body.dataset.sequence;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // preload neighbours — advancing must be instantaneous (§8)
  useEffect(() => {
    [idx - 1, idx + 1].forEach((i) => {
      const img = images[i];
      if (!img) return;
      const el = new Image();
      el.src = `${img.base}/w1600.avif`;
    });
  }, [idx, images]);

  const settle = useCallback((ms: number) => {
    busy.current = true;
    window.setTimeout(() => {
      busy.current = false;
      setLeaving(null);
    }, ms);
  }, []);

  const goto = useCallback(
    (target: number, push = true) => {
      if (busy.current) return; // one frame per intent — no queuing, no skipping
      if (target < 0) return;
      const hold = reducedMotion() ? SETTLE_REDUCED : SETTLE;

      if (phase === "threshold") {
        setPhase("frames");
        setIdx(0);
        if (push) window.history.pushState(null, "", url(0));
        settle(hold);
        return;
      }
      if (target >= images.length) {
        setPhase("end");
        setEndReady(false);
        if (push) window.history.pushState(null, "", url(null));
        // the ending holds — nothing offered for a beat, then one way out
        window.setTimeout(() => setEndReady(true), reducedMotion() ? 400 : 2600);
        settle(hold);
        return;
      }
      if (phase === "end") {
        setPhase("frames");
        setIdx(images.length - 1);
        if (push) window.history.pushState(null, "", url(images.length - 1));
        settle(hold);
        return;
      }
      setMoved(true);
      setLeaving(idx);
      setIdx(target);
      if (push) window.history.pushState(null, "", url(target));
      settle(hold);
    },
    [phase, idx, images.length, settle, url]
  );

  const forward = useCallback(() => {
    if (phase === "threshold") goto(0);
    else if (phase === "end") return;
    else goto(idx + 1);
  }, [phase, idx, goto]);

  const backward = useCallback(() => {
    if (phase === "threshold") return;
    else if (phase === "end") goto(images.length - 1);
    else if (idx === 0) {
      setPhase("threshold");
      window.history.pushState(null, "", url(null));
    } else goto(idx - 1);
  }, [phase, idx, images.length, goto, url]);

  // keyboard — explicit forward and back (§8)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          if (e.key !== "Enter" || phase === "threshold") {
            e.preventDefault();
            forward();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          backward();
          break;
        case "Escape":
          e.preventDefault();
          router.push("/#work");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forward, backward, phase, router]);

  // back/forward buttons re-enter the sequence at the right frame
  useEffect(() => {
    const onPop = () => {
      const id = window.location.pathname.split("/").pop();
      const i = images.findIndex((im) => im.id === id);
      if (i === -1) setPhase("threshold");
      else {
        setPhase("frames");
        setIdx(i);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [images]);

  // swipe — a discrete step, not a scrub
  const onPointerDown = (e: React.PointerEvent) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? forward() : backward();
      return;
    }
    // click zones: left third back, the rest forward
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button")) return;
      e.clientX < window.innerWidth * 0.3 ? backward() : forward();
    }
  };

  const current = images[idx];
  const prev = leaving !== null ? images[leaving] : null;
  const settings = current ? exifLine(current, { lens: false }) : null;
  // every Gora frame is 5:4, but the box is derived rather than assumed so a
  // future sequence set does not silently letterbox
  const ratio = current ? current.w / current.h : 1.25;

  return (
    <main
      data-sequence={set.def.slug}
      data-spill={set.spill}
      className="seq fixed inset-0 z-[60] select-none bg-ground"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      aria-label={`${set.def.title} — sequence, ${images.length} frames`}
    >
      {/* the fog's pale teal washes the room, and leans with the hand — the
          spill does the emotional work, so it is the thing that answers */}
      <FogLean spill={set.spill} />

      {/* the one persistent way back — quiet, top left */}
      <a
        href="/#work"
        className="room-exit type-meta absolute left-[var(--margin)] top-6 z-40"
        onClick={(e) => {
          e.preventDefault();
          router.push("/#work");
        }}
      >
        ←
      </a>

      {phase === "threshold" && (
        <div className="flex h-full flex-col items-center justify-center px-[var(--margin)] text-center">
          <h1 className="type-d2 seq-develop text-hi">{set.def.title}</h1>
          {set.def.place && (
            <p className="type-meta seq-develop-late mt-6 text-mid">{set.def.place}</p>
          )}
          <p className="type-meta-sm seq-develop-later mt-2.5 text-low">
            {images.length} frames · in order · {set.def.when}
          </p>
          <button
            onClick={() => goto(0)}
            className="type-meta t-color seq-develop-last mt-[13svh] cursor-pointer text-mid hover:text-hi"
          >
            begin →
          </button>
        </div>
      )}

      {(phase === "frames" || phase === "end") && current && (
        <>
          <SheetLight className="absolute inset-0 flex items-center justify-center px-[var(--margin)] py-[7svh]">
            {/* the plate: mat, print, and the wall label under it, all one
                column so the label always hangs off the print's own edges */}
            <div
              className="seq-plate"
              data-frame={current.id}
              data-breathing={current.breathing ? "" : undefined}
              style={{ ["--ratio" as string]: String(ratio) }}
            >
              <div className="seq-mat">
                <div className="seq-window">
                  {prev && (
                    <picture key={`out-${prev.id}`} className="seq-out absolute inset-0 block">
                      <source type="image/avif" srcSet={`${prev.base}/w1600.avif`} />
                      <img
                        src={`${prev.base}/w1920.webp`}
                        alt=""
                        width={prev.w}
                        height={prev.h}
                        className="h-full w-full object-contain"
                      />
                    </picture>
                  )}
                  {/* definite box from the first paint, so nothing pops as
                      the frame decodes */}
                  <picture
                    key={`in-${current.id}`}
                    className={`absolute inset-0 block ${prev ? "seq-in" : "seq-develop"}`}
                  >
                    <source
                      type="image/avif"
                      srcSet={`${current.base}/w1080.avif 1080w, ${current.base}/w1600.avif 1600w, ${current.base}/w2200.avif 2200w`}
                      sizes="(min-width: 768px) 72vw, 88vw"
                    />
                    <img
                      src={`${current.base}/w1920.webp`}
                      alt={current.alt}
                      width={current.w}
                      height={current.h}
                      className="h-full w-full object-contain"
                      style={{
                        backgroundImage: `url(${current.thumb})`,
                        backgroundSize: "cover",
                      }}
                    />
                  </picture>
                </div>
              </div>

              {/* the wall label — the beat and the counter on one line, the
                  rig under it, both arriving after the picture has landed.
                  It leaves before the ending, so the last frame stands alone. */}
              <div
                key={`label-${current.id}-${phase}`}
                className="seq-label mt-[clamp(0.85rem,1.5vh,1.4rem)]"
                aria-hidden={phase === "end" ? "true" : undefined}
                data-gone={phase === "end" ? "" : undefined}
              >
                <div className="flex items-baseline justify-between gap-8">
                  <p className="type-meta text-mid">{current.beat}</p>
                  <p className="type-meta-sm tabular-nums text-low" aria-live="polite">
                    {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </p>
                </div>
                {/* share sits on the rig line, beside the frame it exports.
                    Still only while frames run — the threshold is a crossing
                    and the ending is a beat where nothing is offered (§8). */}
                <div className="seq-rig mt-[0.45rem] flex items-baseline justify-between gap-6">
                  <p className="type-meta-sm text-low">{settings}</p>
                  {phase === "frames" && (
                    <ShareButton
                      frame={{
                        id: current.id,
                        base: current.base,
                        w: current.w,
                        h: current.h,
                        alt: current.alt,
                        rig: settings,
                        context: set.def.title,
                        position: `${String(idx + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`,
                        date: shootMonth(current.exif?.date),
                      }}
                    />
                  )}
                </div>
              </div>

              {/* said once, on the first frame, then never again */}
              {phase === "frames" && idx === 0 && !moved && (
                <p className="seq-hint type-meta-sm absolute inset-x-0 -bottom-9 text-center text-low">
                  ← →
                </p>
              )}
            </div>
          </SheetLight>

          {/* the ending: the plate holds, the label is gone, and only after a
              long beat does one quiet way out appear */}
          {phase === "end" && endReady && (
            <p className="seq-develop absolute inset-x-0 bottom-7 z-40 text-center">
              <a
                href="/#work"
                className="type-meta t-color text-low hover:text-hi"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/#work");
                }}
              >
                ← sets
              </a>
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {current.beat ? `${current.beat}. ` : ""}
            {current.alt}
          </p>
        </>
      )}
    </main>
  );
}

/**
 * The fog leans with the hand.
 *
 * The spill layer is a full-screen radial bloom; repainting its gradient
 * position every frame would be a full-screen repaint every frame, so the
 * lean is a compositor transform instead. Amplitude is deliberately under
 * the threshold of "something moved" — §6 only permits "the light changed".
 * Off under reduced motion and on coarse pointers, like every other field.
 */
function FogLean({ spill }: { spill: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;

    const tick = () => {
      cx += (tx - cx) * 0.045; // slower than the plate's light: fog has mass
      cy += (ty - cy) * 0.045;
      el.style.transform = `translate3d(${cx.toFixed(2)}vw, ${cy.toFixed(2)}vh, 0)`;
      if (Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const unsub = onPointer((px, py) => {
      if (px < 0) return;
      tx = (px / window.innerWidth - 0.5) * 7;
      ty = (py / window.innerHeight - 0.5) * 5;
      wake();
    });
    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="spill-layer !absolute"
      style={{ ["--spill" as string]: spill }}
      aria-hidden="true"
    />
  );
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
