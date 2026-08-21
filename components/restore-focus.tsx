"use client";

/**
 * Focus choreography (DESIGN.md §11). Leaving a piece view returns focus to
 * the frame it was opened from, not to the top of the document. The piece
 * view records the origin; the set view claims it once, on arrival.
 */
import { useEffect } from "react";
import { jumpTo } from "@/components/smooth-scroll";

export const ORIGIN_KEY = "kestrra-origin-frame";

export function RestoreFocus({ setSlug }: { setSlug: string }) {
  useEffect(() => {
    const raw = sessionStorage.getItem(ORIGIN_KEY);
    if (!raw) return;
    sessionStorage.removeItem(ORIGIN_KEY);
    const [slug, id] = raw.split("/");
    if (slug !== setSlug) return;
    const el = document.getElementById(`frame-${id}`);
    if (!el) return;
    // Through Lenis, or it animates back to the position it still believes
    // the page is at and the frame you came from slides out from under focus.
    jumpTo(el);
    el.focus({ preventScroll: true });
  }, [setSlug]);

  return null;
}
