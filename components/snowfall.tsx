"use client";

import { useEffect, useRef } from "react";

/**
 * Slow snow behind the Gora prints. Runs only while it is on screen, and not
 * at all for anyone who has asked for less motion.
 */
export function Snowfall({ count = 90 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let on = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const flakes = Array.from({ length: count }, () => {
      const r = 0.5 + Math.random() * 1.7;
      return {
        x: Math.random(),
        y: Math.random(),
        r,
        // the bigger, nearer flakes fall a little faster
        v: (0.012 + Math.random() * 0.02) * (0.7 + r * 0.25),
        sway: Math.random() * Math.PI * 2,
        a: 0.12 + Math.random() * 0.4,
      };
    });

    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 64) / 1000 : 0;
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      for (const f of flakes) {
        f.y += f.v * dt;
        if (f.y > 1.02) {
          f.y = -0.02;
          f.x = Math.random();
        }
        const x = (f.x + Math.sin(t / 3800 + f.sway) * 0.01) * w;
        ctx.globalAlpha = f.a;
        ctx.beginPath();
        ctx.arc(x, f.y * h, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) {
        on = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && on) {
        on = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(c);
    const ro = new ResizeObserver(size);
    ro.observe(c);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
