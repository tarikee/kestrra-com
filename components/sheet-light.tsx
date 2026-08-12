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

    const cur = new Float32Array(frames.length);
    const tgt = new Float32Array(frames.length);
    const wrote = new Float32Array(frames.length).fill(-1);
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let running = false;
    let onScreen = false;

    const tick = () => {
      // one batched read pass, then one batched write pass — interleaving them
      // costs a full layout flush per frame per frame
      for (let i = 0; i < frames.length; i++) {
        const r = frames[i].getBoundingClientRect();
        if (r.width === 0 || r.bottom < -REACH || r.top > innerHeight + REACH) {
          tgt[i] = 0;
          continue;
        }
        // distance from the frame's *box*, not its centre: anywhere on the
        // photograph is fully lit, and it falls away over REACH outside it
        const dx = Math.max(0, Math.abs(mx - (r.left + r.width / 2)) - r.width / 2);
        const dy = Math.max(0, Math.abs(my - (r.top + r.height / 2)) - r.height / 2);
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

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      unsub();
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
