"use client";

/**
 * Focus choreography (DESIGN.md §11). Leaving a piece view returns focus to
 * the frame it was opened from, not to the top of the document. The piece
 * view records the origin; the set view claims it once, on arrival.
 */
import { useEffect } from "react";

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
    el.scrollIntoView({ block: "center", behavior: "instant" });
    el.focus({ preventScroll: true });
  }, [setSlug]);

  return null;
}
