"use client";

/**
 * Smooth scroll — the transport, not an effect.
 *
 * DESIGN.md §4: scroll moves the world past a locked subject rather than
 * moving the subject. Native wheel scroll is a series of jumps, which reads
 * as the page being shoved; smoothing turns it into one continuous drift, so
 * the windhover rule survives the wheel as well as the pointer.
 *
 * Lenis drives the *real* document scroll position — no wrapper element, no
 * transformed content. That is deliberate and load-bearing: the site's
 * `animation-timeline: scroll()` / `view()` animations, every `window.scrollY`
 * reader, `position: sticky`, and the View Transitions all keep working
 * because the browser still believes it is doing the scrolling. A wrapper
 * setup would silently break all four.
 */
import { useEffect } from "react";
import Lenis from "lenis";

/**
 * lerp 0.22 — Tarik's call, landing between the two measured extremes: it
 * keeps more of the drift than 0.3 without the trailing input that made 0.12
 * read as lag. The history is worth keeping, because the frame rate was never
 * the problem — every route holds a locked 60fps on a real GPU at DPR 2, even
 * at 4x CPU throttle. What the eye was reading is the time a single wheel tick
 * takes to reach 90% of its travel:
 *
 *     0.12 → 341ms   (shipped first, reported as laggy)
 *     0.22 → ~190ms  (here)
 *     0.30 → 143ms
 *
 * Lenis normalises lerp against real frame time, so this holds on a 120Hz
 * display too.
 */
const LERP = 0.22;

let instance: Lenis | null = null;

/** The live instance, or null when smoothing is off (reduced motion, SSR). */
export function lenis() {
  return instance;
}

/**
 * Jump without smoothing, keeping Lenis in sync. Anything that moves the
 * scroll position itself — focus restoration, an anchor jump — must go
 * through this or Lenis will animate back to where it thought it was.
 */
export function jumpTo(target: number | HTMLElement) {
  // The browser does the landing, exactly as it did before Lenis existed —
  // Lenis is only told where it ended up. Handing the element to Lenis
  // instead looks equivalent and is not: on a fresh set view its cached
  // scroll limit is still the height of a page whose photographs have not
  // laid out yet, so it clamps the jump short and then holds it there.
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "auto" });
  else target.scrollIntoView({ block: "center", behavior: "instant" });

  if (!instance) return;
  instance.resize();
  instance.scrollTo(window.scrollY, { immediate: true, force: true });
}

export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      if (instance) return;
      instance = new Lenis({
        lerp: LERP,
        // Touch keeps its native momentum. iOS and Android already ship a
        // tuned inertial scroll; syncing it through JS costs a frame of
        // latency, kills rubber-banding and pull-to-refresh, and reads as
        // lag on exactly the devices that notice it most. The platform's
        // own smoothing IS the mobile translation of this idea, not a
        // fallback from it.
        smoothWheel: true,
        syncTouch: false,
        // Anchors stay native and instant — the skip link must land now,
        // not glide. Lenis resyncs itself off the resulting scroll event.
        anchors: false,
        autoRaf: true,
      });
    };

    const stop = () => {
      instance?.destroy();
      instance = null;
    };

    if (!query.matches) start();

    // Reduced motion is a live setting, not a mount-time reading.
    const onPreference = () => (query.matches ? stop() : start());
    query.addEventListener("change", onPreference);

    /**
     * The sequence and the gallery plate both take the room and set
     * `body { overflow: hidden }`. Lenis has to stand down for the duration
     * or it keeps interpreting the wheel against a document that can no
     * longer move, and releases that stored momentum on exit.
     */
    const locked = () =>
      document.body.hasAttribute("data-sequence") || document.body.hasAttribute("data-plate");

    const observer = new MutationObserver(() => {
      if (!instance) return;
      if (locked()) instance.stop();
      else instance.start();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-sequence", "data-plate"],
    });

    return () => {
      query.removeEventListener("change", onPreference);
      observer.disconnect();
      stop();
    };
  }, []);

  return null;
}
