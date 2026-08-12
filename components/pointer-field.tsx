"use client";

/**
 * The room responds to where you are in it — below the hero as well as in it.
 *
 * Writes two eased, normalised pointer coordinates (−1…1) onto its own
 * element as `--px` / `--py`, plus `--pin` (0 when the pointer is elsewhere,
 * 1 when it is inside). Children position themselves off those variables, so
 * the whole thing is CSS transforms on the compositor — no React state, no
 * re-render, nothing on the main thread but one eased number.
 *
 * It eases rather than tracks: the pointer suggests where the light is, it
 * never drags anything. Disabled under reduced motion and on coarse pointers,
 * where the concept does not apply and the cost is not worth paying.
 */
import { useEffect, useRef } from "react";
import { onPointer } from "@/lib/pointer";

export function PointerField({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let cx = 0;
    let cy = 0;
    let ci = 0;
    let tx = 0;
    let ty = 0;
    let ti = 0;
    let raf = 0;
    let running = false;
    // only while the block is actually on screen — ten of these on the index
    let onScreen = false;

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      ci += (ti - ci) * 0.07;
      el.style.setProperty("--px", cx.toFixed(4));
      el.style.setProperty("--py", cy.toFixed(4));
      el.style.setProperty("--pin", ci.toFixed(4));
      const settled =
        Math.abs(tx - cx) < 0.0015 && Math.abs(ty - cy) < 0.0015 && Math.abs(ti - ci) < 0.0015;
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

    const onMove = (px: number, py: number) => {
      if (!onScreen) return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((px - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((py - r.top) / r.height) * 2 - 1));
      ti = py >= r.top && py <= r.bottom ? 1 : 0;
      wake();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      ti = 0;
      wake();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) onLeave();
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(el);
    const unsub = onPointer(onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      unsub();
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
