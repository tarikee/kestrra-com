"use client";

/**
 * Adjacent navigation within a set. Arrow keys, on-screen affordances, and
 * Escape back to the set. The origin frame is recorded so focus returns to
 * it on exit (DESIGN.md §11).
 */
import { useEffect } from "react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { ORIGIN_KEY } from "./restore-focus";
import { plainClick, useUp } from "./back-link";
import { useDict, useHref } from "./lang";
import { fmt } from "@/lib/i18n";

export function PieceNav({
  setSlug,
  setTitle,
  currentId,
  prevId,
  nextId,
  position,
}: {
  setSlug: string;
  setTitle: string;
  currentId: string;
  prevId: string | null;
  nextId: string | null;
  position: string;
}) {
  const router = useTransitionRouter();
  const up = useUp();
  const ui = useDict().piece;
  const href = useHref();
  const remember = () => sessionStorage.setItem(ORIGIN_KEY, `${setSlug}/${currentId}`);

  // Leaving by the browser's back button lands on the set at this frame too,
  // not wherever the browser guesses.
  useEffect(() => {
    const onPop = () => sessionStorage.setItem(ORIGIN_KEY, `${setSlug}/${currentId}`);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setSlug, currentId]);

  useEffect(() => {
    // stepping through a set replaces the frame in history, so one back
    // press returns to the set however many frames were looked at
    const go = (id: string) => router.replace(href(`/sets/${setSlug}/${id}`));
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft" && prevId) { e.preventDefault(); go(prevId); }
      if (e.key === "ArrowRight" && nextId) { e.preventDefault(); go(nextId); }
      if (e.key === "Escape") {
        e.preventDefault();
        sessionStorage.setItem(ORIGIN_KEY, `${setSlug}/${currentId}`);
        up(href(`/sets/${setSlug}`));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, up, href, setSlug, currentId, prevId, nextId]);

  return (
    <nav
      className="mx-[var(--margin)] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-hairline pb-4"
      aria-label={fmt(ui.frameNav, { title: setTitle })}
    >
      <Link
        href={href(`/sets/${setSlug}`)}
        className="dev-link t-color type-meta whitespace-nowrap"
        onClick={(e) => {
          remember();
          // up to the set: back through history when that is where this
          // frame was opened from, so back never loops between the two
          if (!plainClick(e)) return;
          e.preventDefault();
          up(href(`/sets/${setSlug}`));
        }}
      >
        ← {setTitle}
      </Link>
      <div className="flex items-baseline gap-6">
        <p className="type-meta whitespace-nowrap text-low" aria-live="polite">{position}</p>
        <div className="flex gap-4">
          {prevId ? (
            <Link href={href(`/sets/${setSlug}/${prevId}`)} replace className="tap type-meta t-color text-mid hover:text-hi" aria-label={ui.prevFrame}>
              {ui.prev}
            </Link>
          ) : (
            <span className="type-meta text-low/50" aria-hidden="true">{ui.prev}</span>
          )}
          {nextId ? (
            <Link href={href(`/sets/${setSlug}/${nextId}`)} replace className="tap type-meta t-color text-mid hover:text-hi" aria-label={ui.nextFrame}>
              {ui.next}
            </Link>
          ) : (
            <span className="type-meta text-low/50" aria-hidden="true">{ui.next}</span>
          )}
        </div>
      </div>
    </nav>
  );
}
