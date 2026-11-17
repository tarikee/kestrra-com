"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTransitionRouter } from "next-view-transitions";
import { useSwipe } from "./frame-steps";

export type FullFrame = { id: string; base: string; w: number; h: number; alt: string };

/** largest rendition first; a missing file steps down to the next */
const CHAIN = ["w2880.avif", "w2880.webp", "w1920.webp"];

/**
 * The photo as large as the screen allows, whole, on black.
 *
 * A button in the share dock. Tapping it opens a fixed full-viewport view
 * (and asks the browser for real fullscreen where it is offered; iPhone
 * Safari is not, so the fixed view is the whole of it there). The image is
 * contained, never cropped, and loads only when opened. Escape, the close
 * button, arrow keys and a swipe all work; stepping moves through the set
 * and closing lands on the photo you were last looking at.
 */
export function FullViewButton({
  setSlug,
  frames,
  index,
}: {
  setSlug: string;
  frames: FullFrame[];
  index: number;
}) {
  const router = useTransitionRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [at, setAt] = useState(index);
  const [tier, setTier] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const atRef = useRef(index);
  useEffect(() => setMounted(true), []);

  const step = useCallback(
    (d: 1 | -1) => {
      const to = atRef.current + d;
      if (to < 0 || to >= frames.length) return;
      atRef.current = to;
      setAt(to);
      setTier(0);
    },
    [frames.length],
  );

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setOpen(false);
    if (atRef.current !== index) router.replace(`/sets/${setSlug}/${frames[atRef.current].id}`);
  }, [frames, index, router, setSlug]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const was = btn.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      // the page's own arrow and Escape keys must not also fire
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    const onFs = () => {
      if (!document.fullscreenElement) close();
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("fullscreenchange", onFs);
      was?.focus();
    };
  }, [open, close, step]);

  const swipe = useSwipe(step);
  const f = frames[at];

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="share-button share-dock dock-second"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          atRef.current = index;
          setAt(index);
          setTier(0);
          setOpen(true);
          if (document.fullscreenEnabled) {
            // the overlay mounts next; ask once it is there
            requestAnimationFrame(() => shell.current?.requestFullscreen?.().catch(() => {}));
          }
        }}
      >
        <svg className="share-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M4.5 9.5v-5h5M14.5 4.5h5v5M19.5 14.5v5h-5M9.5 19.5h-5v-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
        <span className="sr-only">View this photo full screen</span>
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            ref={shell}
            className="full-view"
            role="dialog"
            aria-modal="true"
            aria-label={f.alt || "Photo, full screen"}
            onTouchStart={(e) => {
              e.stopPropagation(); // portal events bubble to the page's own swipe
              swipe.onTouchStart(e);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              swipe.onTouchEnd(e);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={f.id + tier}
              className="full-view-img"
              src={`${f.base}/${CHAIN[tier]}`}
              alt={f.alt}
              width={f.w}
              height={f.h}
              onError={() => setTier((t) => Math.min(t + 1, CHAIN.length - 1))}
              draggable={false}
            />
            <button ref={closeBtn} type="button" className="full-view-close" onClick={close}>
              <span className="sr-only">Close full screen</span>
              <svg className="share-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
