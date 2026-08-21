"use client";

/**
 * The contact sheet answers your hand.
 *
 * A set page is a sheet of frames laid flat and in order — it must not get the
 * index's travelling planes, because the job here is reading the work, not
 * being shown it. So the response is the smallest true one: the frame under
 * your hand rises off the sheet and spills light around its edge, and the
 * frames beside it catch a little of the same, falling off with distance.
 *
 * The lift and the spill are geometry and light *around* the frame. Nothing
 * touches the photograph itself — the grade is not something a cursor gets to
 * change.
 *
 * Writes one eased number per frame as `--near`; CSS does the rest on the
 * compositor. Off under reduced motion and on coarse pointers.
 *
 * Geometry is measured in *document* space and cached, not read per animation
 * frame. A set page has sixteen frames and could afford the reads; the Gallery
 * wall has a hundred and twenty-five, and a hundred and twenty-five forced
 * layouts per frame is a hundred and twenty-five too many. The cache is
 * rebuilt on resize, on a ResizeObserver of the root, and as lazy frames
 * decode — the three things that actually move a frame on this site.
 */

import { useEffect, useRef } from "react";
import { onPointer } from "@/lib/pointer";

/** how far past a frame's own edge the light still reaches, in px */
const REACH = 150;

export function SheetLight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const frames = Array.from(root.querySelectorAll<HTMLElement>("[data-frame]"));
    if (!frames.length) return;

    const n = frames.length;
    const cur = new Float32Array(n);
    const tgt = new Float32Array(n);
    const wrote = new Float32Array(n).fill(-1);
    // document-space box centres and half-extents, measured once
    const cxs = new Float64Array(n);
    const cys = new Float64Array(n);
    const hws = new Float64Array(n);
    const hhs = new Float64Array(n);
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let running = false;
    let onScreen = false;

    const measure = () => {
      const sx = window.scrollX;
      const sy = window.scrollY;
      for (let i = 0; i < n; i++) {
        const r = frames[i].getBoundingClientRect();
        hws[i] = r.width / 2;
        hhs[i] = r.height / 2;
        cxs[i] = r.left + sx + hws[i];
        cys[i] = r.top + sy + hhs[i];
      }
    };

    const tick = () => {
      // pointer is viewport-space, the cache is document-space — one scroll
      // read converts between them, instead of n forced layouts
      const sx = window.scrollX;
      const sy = window.scrollY;
      const px = mx + sx;
      const py = my + sy;
      const top = sy - REACH;
      const bottom = sy + window.innerHeight + REACH;
      for (let i = 0; i < n; i++) {
        if (hws[i] === 0 || cys[i] + hhs[i] < top || cys[i] - hhs[i] > bottom) {
          tgt[i] = 0;
          continue;
        }
        // distance from the frame's *box*, not its centre: anywhere on the
        // photograph is fully lit, and it falls away over REACH outside it
        const dx = Math.max(0, Math.abs(px - cxs[i]) - hws[i]);
        const dy = Math.max(0, Math.abs(py - cys[i]) - hhs[i]);
        const d = Math.sqrt(dx * dx + dy * dy) / REACH;
        const u = d >= 1 ? 0 : 1 - d;
        tgt[i] = u * u * (3 - 2 * u);
      }
      let settled = true;
      for (let i = 0; i < frames.length; i++) {
        cur[i] += (tgt[i] - cur[i]) * 0.14;
        const q = Math.round(cur[i] * 100) / 100;
        if (q !== wrote[i]) {
          wrote[i] = q;
          frames[i].style.setProperty("--near", String(q));
        }
        if (Math.abs(tgt[i] - cur[i]) > 0.004) settled = false;
      }
      if (settled) {
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
      if (!onScreen) return;
      mx = px;
      my = py;
      wake();
    });
    const onLeave = () => {
      mx = -9999;
      my = -9999;
      wake();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) onLeave();
      },
      { rootMargin: "15% 0px" }
    );
    io.observe(root);
    root.addEventListener("pointerleave", onLeave);

    measure();

    // the hand stays where it is while the wall moves under it, so scrolling
    // changes which frames are lit just as much as moving does
    const onScroll = () => {
      if (onScreen) wake();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // the three things that actually move a frame: the viewport resizing, the
    // sheet reflowing, and a lazy frame arriving and taking its space
    const remeasure = () => {
      measure();
      wake();
    };
    window.addEventListener("resize", remeasure, { passive: true });
    const ro = new ResizeObserver(remeasure);
    ro.observe(root);
    root.addEventListener("load", remeasure, { capture: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      unsub();
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("load", remeasure, { capture: true });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
