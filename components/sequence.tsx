"use client";

/**
 * Sequence mode — built for Gora Polaroids (DESIGN.md §8).
 *
 * One frame at a time, ordered, deliberate. Entry is a threshold the visitor
 * crosses on purpose. Frames advance by discrete intent — keys, click zones,
 * swipe — never free scrolling, never a timer. Transitions are exposure
 * events: the light goes out of one frame, holds, and develops into the
 * next. This set alone is permitted to retime the global motion tokens
 * (scoped below, still derived from the scale). The ending holds; nothing is
 * offered for a beat; then one quiet way out appears.
 *
 * Forbidden here and absent on purpose: captions, music, progress bars,
 * thumbnails, autoplay, any grade shift. The counter is the only chrome.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import type { WorkSet } from "@/lib/work";

type Phase = "threshold" | "frames" | "end";

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

      if (phase === "threshold") {
        setPhase("frames");
        setIdx(0);
        if (push) window.history.pushState(null, "", url(0));
        settle(reducedMotion() ? 150 : 1250);
        return;
      }
      if (target >= images.length) {
        setPhase("end");
        setEndReady(false);
        if (push) window.history.pushState(null, "", url(null));
        // the ending holds — nothing offered for a beat, then one way out
        window.setTimeout(() => setEndReady(true), reducedMotion() ? 400 : 2200);
        settle(reducedMotion() ? 150 : 1250);
        return;
      }
      if (phase === "end") {
        setPhase("frames");
        setIdx(images.length - 1);
        if (push) window.history.pushState(null, "", url(images.length - 1));
        settle(reducedMotion() ? 150 : 1250);
        return;
      }
      setLeaving(idx);
      setIdx(target);
      if (push) window.history.pushState(null, "", url(target));
      settle(reducedMotion() ? 150 : 1250);
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
      if (target.closest("a")) return;
      e.clientX < window.innerWidth * 0.3 ? backward() : forward();
    }
  };

  const current = images[idx];
  const prev = leaving !== null ? images[leaving] : null;

  return (
    <main
      data-sequence={set.def.slug}
      data-spill={set.spill}
      className="seq fixed inset-0 z-[60] select-none bg-ground"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      aria-label={`${set.def.title} — sequence, ${images.length} frames`}
    >
      {/* the fog's pale teal washes the room — the spill does the emotional work */}
      <div
        className="spill-layer !absolute"
        style={{ ["--spill" as string]: set.spill }}
        aria-hidden="true"
      />

      {/* the one persistent way back — quiet, top left */}
      <a
        href="/#work"
        className="tap type-meta-sm t-color absolute left-[var(--margin)] top-6 z-40 text-low hover:text-mid"
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
          <p className="type-meta seq-develop-late mt-6 text-mid">
            {images.length} frames · in order · {set.def.when}
          </p>
          <button
            onClick={() => goto(0)}
            className="type-meta t-color seq-develop-later mt-[14svh] cursor-pointer text-mid hover:text-hi"
          >
            begin →
          </button>
        </div>
      )}

      {(phase === "frames" || phase === "end") && current && (
        <>
          <div className="absolute inset-0 flex items-center justify-center px-[var(--margin)] py-[10svh]">
            {prev && (
              <picture key={`out-${prev.id}`} className="seq-out absolute max-h-[74svh] max-w-[86vw]">
                <source type="image/avif" srcSet={`${prev.base}/w1600.avif`} />
                <img
                  src={`${prev.base}/w1920.webp`}
                  alt=""
                  width={prev.w}
                  height={prev.h}
                  className="max-h-[74svh] w-auto max-w-full object-contain"
                />
              </picture>
            )}
            <picture key={`in-${current.id}`} className={prev ? "seq-in" : "seq-develop"}>
              <source
                type="image/avif"
                srcSet={`${current.base}/w1080.avif 1080w, ${current.base}/w1600.avif 1600w, ${current.base}/w2200.avif 2200w`}
                sizes="86vw"
              />
              <img
                src={`${current.base}/w1920.webp`}
                alt={current.alt}
                width={current.w}
                height={current.h}
                className="max-h-[74svh] w-auto max-w-full object-contain"
                style={{ backgroundImage: `url(${current.thumb})`, backgroundSize: "cover" }}
              />
            </picture>
          </div>
          {/* the last frame holds; nothing is offered for a beat; then one
              quiet way out appears where the counter was */}
          {phase === "frames" ? (
            <p
              className="type-meta absolute inset-x-0 bottom-7 z-40 text-center text-low"
              aria-live="polite"
            >
              {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
          ) : (
            endReady && (
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
            )
          )}
          <p className="sr-only" aria-live="polite">{current.alt}</p>
        </>
      )}
    </main>
  );
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
