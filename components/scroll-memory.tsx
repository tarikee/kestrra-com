"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { jumpTo } from "@/components/smooth-scroll";
import { ORIGIN_KEY } from "@/components/restore-focus";

/** where each page of this tab was left, by path */
const KEY = "kestrra:scroll";

let places: Record<string, number> | null = null;

function known(): Record<string, number> {
  if (places) return places;
  try {
    const v: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
    places = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, number>) : {};
  } catch {
    places = {};
  }
  return places;
}

function keep() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(places ?? {}));
  } catch {
    // storage refused: back still works within this page load
  }
}

/** the path the browser's back or forward is taking us to, read once on arrival */
let traversing: string | null = null;

/**
 * Put the page at `top`, again on the next frames while it is still too
 * short to get there, until it arrives or the visitor takes over.
 */
function settle(top: number) {
  let frame = 0;
  let tries = 0;
  const takeover = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  const stop = () => {
    cancelAnimationFrame(frame);
    takeover.forEach((e) => window.removeEventListener(e, stop));
  };
  const step = () => {
    if (Math.abs(window.scrollY - top) > 1) jumpTo(top);
    if (Math.abs(window.scrollY - top) <= 1 || ++tries > 60) return stop();
    frame = requestAnimationFrame(step);
  };
  takeover.forEach((e) => window.addEventListener(e, stop, { passive: true }));
  step();
  return stop;
}

/**
 * Back returns to where you were on the page, not its top. The browser can't
 * do this by itself here: on back the view transition keeps the page you are
 * leaving on screen while the browser restores, so it restores against the
 * wrong page. Instead each page's place is kept by path and put back the
 * moment that page is on screen again, before the transition's picture of it
 * is taken, so it lands there rather than jumping after.
 */
export function ScrollMemory() {
  const path = usePathname();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    history.scrollRestoration = "manual";

    const onPop = () => {
      traversing = location.pathname;
    };

    let queued = false;
    const onScroll = () => {
      // between a back and the old page coming back, the address already
      // names the page being returned to: nothing to note until they agree
      if (location.pathname !== shown.current) return;
      known()[location.pathname] = Math.round(window.scrollY);
      if (queued) return;
      queued = true;
      setTimeout(() => {
        queued = false;
        keep();
      }, 250);
    };

    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", keep);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", keep);
    };
  }, []);

  useLayoutEffect(() => {
    const first = shown.current === null;
    shown.current = path;

    let returning = traversing === path;
    traversing = null;
    if (first) {
      // a reload or a back from another site lands where the page was left too
      try {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        returning = nav?.type === "reload" || nav?.type === "back_forward";
      } catch {
        returning = false;
      }
    }
    if (!returning) return;

    // back from one of its photos: the set places itself at that photo
    try {
      const origin = sessionStorage.getItem(ORIGIN_KEY);
      if (origin && path === `/sets/${origin.split("/")[0]}`) return;
    } catch {
      // no storage, no origin to defer to
    }

    const top = known()[path];
    if (!top) return;
    return settle(top);
  }, [path]);

  return null;
}
