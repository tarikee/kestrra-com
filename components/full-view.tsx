"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTransitionRouter } from "next-view-transitions";
import { useDict, useHref } from "@/components/lang";

export type FullFrame = { id: string; base: string; w: number; h: number; alt: string };

type View = { s: number; x: number; y: number };
type Gesture = { mode: "pinch" | "pan" | "swipe"; x: number; y: number; d: number; v: View; moved: boolean; t: number };
const ID: View = { s: 1, x: 0, y: 0 };
const MAX = 5;

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
 *
 * Zoom is the view's own, not the browser's (a parent's touch-action would
 * cancel a native pinch): two fingers pinch about their midpoint, one finger
 * moves a zoomed photo, a double tap or double click goes to 2.5x at that
 * point and back, a wheel or trackpad pinch zooms at the cursor. A swipe
 * steps only while the photo is at its fitted size.
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
  const ui = useDict().piece;
  const href = useHref();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [at, setAt] = useState(index);
  const [tier, setTier] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const atRef = useRef(index);
  const img = useRef<HTMLImageElement>(null);
  const [v, setV] = useState<View>(ID);
  const [ease, setEase] = useState(false);
  const vRef = useRef<View>(ID);
  const g = useRef<Gesture | null>(null);
  const tap = useRef<{ t: number; x: number; y: number } | null>(null);
  const touchedAt = useRef(0);
  useEffect(() => setMounted(true), []);

  /** set the view, keeping the photo's edges from leaving the screen */
  const apply = useCallback((n: View, animate = false) => {
    const s = Math.min(MAX, Math.max(1, n.s));
    let { x, y } = n;
    const el = img.current;
    if (el) {
      const mx = Math.max(0, (s * el.offsetWidth - window.innerWidth) / 2);
      const my = Math.max(0, (s * el.offsetHeight - window.innerHeight) / 2);
      x = Math.min(mx, Math.max(-mx, x));
      y = Math.min(my, Math.max(-my, y));
    }
    vRef.current = s === 1 ? ID : { s, x, y };
    setEase(animate);
    setV(vRef.current);
  }, []);

  /** zoom to scale s keeping the photo point under (px, py) where it is */
  const zoomAt = useCallback(
    (px: number, py: number, s: number, from: View = vRef.current, fx = px, fy = py, animate = false) => {
      const to = Math.min(MAX, Math.max(1, s));
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const qx = (fx - cx - from.x) / from.s;
      const qy = (fy - cy - from.y) / from.s;
      apply({ s: to, x: px - cx - to * qx, y: py - cy - to * qy }, animate);
    },
    [apply],
  );

  const step = useCallback(
    (d: 1 | -1) => {
      const to = atRef.current + d;
      if (to < 0 || to >= frames.length) return;
      atRef.current = to;
      vRef.current = ID;
      setV(ID);
      setAt(to);
      setTier(0);
    },
    [frames.length],
  );

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setOpen(false);
    if (atRef.current !== index) router.replace(href(`/sets/${setSlug}/${frames[atRef.current].id}`));
  }, [frames, index, router, setSlug, href]);

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
    // wheel and trackpad pinch zoom here, not the page; iOS page-zoom off
    const el = shell.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = vRef.current;
      zoomAt(e.clientX, e.clientY, c.s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)));
    };
    const noGesture = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("fullscreenchange", onFs);
    el?.addEventListener("wheel", onWheel, { passive: false });
    el?.addEventListener("gesturestart", noGesture);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("fullscreenchange", onFs);
      el?.removeEventListener("wheel", onWheel);
      el?.removeEventListener("gesturestart", noGesture);
      was?.focus();
    };
  }, [open, close, step, zoomAt]);

  const f = frames[at];
  const dist = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const mid = (t: React.TouchList) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // portal events bubble to the page's own swipe
    touchedAt.current = e.timeStamp;
    const t = e.touches;
    if (t.length >= 2) {
      const m = mid(t);
      g.current = { mode: "pinch", x: m.x, y: m.y, d: dist(t), v: vRef.current, moved: true, t: e.timeStamp };
    } else {
      const mode = vRef.current.s > 1 ? "pan" : "swipe";
      g.current = { mode, x: t[0].clientX, y: t[0].clientY, d: 0, v: vRef.current, moved: false, t: e.timeStamp };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    const st = g.current;
    if (!st) return;
    const t = e.touches;
    if (st.mode === "pinch" && t.length >= 2) {
      const m = mid(t);
      zoomAt(m.x, m.y, (st.v.s * dist(t)) / st.d, st.v, st.x, st.y);
    } else if (t.length === 1) {
      const dx = t[0].clientX - st.x;
      const dy = t[0].clientY - st.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) st.moved = true;
      if (st.mode === "pan") apply({ s: st.v.s, x: st.v.x + dx, y: st.v.y + dy });
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const st = g.current;
    if (!st) return;
    if (e.touches.length > 0) {
      // one finger lifted from a pinch: the other carries on as a pan
      if (st.mode === "pinch" && e.touches.length === 1) {
        const p = e.touches[0];
        g.current = { mode: "pan", x: p.clientX, y: p.clientY, d: 0, v: vRef.current, moved: true, t: e.timeStamp };
      }
      return;
    }
    g.current = null;
    const p = e.changedTouches[0];
    if (st.mode === "swipe") {
      const dx = p.clientX - st.x;
      const dy = p.clientY - st.y;
      if (Math.abs(dx) >= 60 && Math.abs(dx) >= Math.abs(dy) * 1.5) {
        tap.current = null;
        step(dx < 0 ? 1 : -1);
        return;
      }
    }
    if (st.moved || e.timeStamp - st.t > 300) return;
    const prev = tap.current;
    if (prev && e.timeStamp - prev.t < 320 && Math.hypot(p.clientX - prev.x, p.clientY - prev.y) < 30) {
      tap.current = null;
      if (vRef.current.s > 1) apply(ID, true);
      else zoomAt(p.clientX, p.clientY, 2.5, ID, p.clientX, p.clientY, true);
    } else {
      tap.current = { t: e.timeStamp, x: p.clientX, y: p.clientY };
    }
  };

  // a mouse drags a zoomed photo
  const drag = useRef<{ x: number; y: number; v: View } | null>(null);

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
          vRef.current = ID;
          setV(ID);
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
        <span className="sr-only">{ui.fullView}</span>
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            ref={shell}
            className="full-view"
            role="dialog"
            aria-modal="true"
            aria-label={f.alt || ui.fullViewDialog}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={() => (g.current = null)}
            onDoubleClick={(e) => {
              if (e.timeStamp - touchedAt.current < 800) return; // the touch path handled it
              if (vRef.current.s > 1) apply(ID, true);
              else zoomAt(e.clientX, e.clientY, 2.5, ID, e.clientX, e.clientY, true);
            }}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse" || vRef.current.s === 1) return;
              drag.current = { x: e.clientX, y: e.clientY, v: vRef.current };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (d) apply({ s: d.v.s, x: d.v.x + e.clientX - d.x, y: d.v.y + e.clientY - d.y });
            }}
            onPointerUp={() => (drag.current = null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={img}
              key={f.id + tier}
              className="full-view-img"
              style={{
                transform: `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.s})`,
                transition: ease ? "transform 0.22s ease-out" : "none",
                cursor: v.s > 1 ? "grab" : "zoom-in",
              }}
              src={`${f.base}/${CHAIN[tier]}`}
              alt={f.alt}
              width={f.w}
              height={f.h}
              onError={() => setTier((t) => Math.min(t + 1, CHAIN.length - 1))}
              draggable={false}
            />
            <button ref={closeBtn} type="button" className="full-view-close" onClick={close}>
              <span className="sr-only">{ui.fullClose}</span>
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
