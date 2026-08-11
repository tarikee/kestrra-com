"use client";

/**
 * The light spill — DESIGN.md §6. The room takes its colour from the body of
 * work you're inside. Keyed per set, drifting slowly between worlds as you
 * cross set boundaries. Barely perceptible by design.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SpillDriver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-spill]"));
    if (blocks.length === 0) return;

    const visible = new Map<HTMLElement, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target as HTMLElement, e.intersectionRatio);
        let best: HTMLElement | null = null;
        let bestR = 0.18; // below this, the room stays neutral
        for (const [el, r] of visible) {
          if (r > bestR) { best = el; bestR = r; }
        }
        if (best) root.style.setProperty("--spill", best.dataset.spill!);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [pathname]);

  return <div className="spill-layer" aria-hidden="true" />;
}
