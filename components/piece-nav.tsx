"use client";

/**
 * Adjacent navigation within a set. Arrow keys, on-screen affordances, and
 * Escape back to the set. The origin frame is recorded so focus returns to
 * it on exit (DESIGN.md §11).
 */
import { useEffect } from "react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { ORIGIN_KEY } from "./restore-focus";

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
    const go = (id: string) => router.replace(`/work/${setSlug}/${id}`);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft" && prevId) { e.preventDefault(); go(prevId); }
      if (e.key === "ArrowRight" && nextId) { e.preventDefault(); go(nextId); }
      if (e.key === "Escape") {
        e.preventDefault();
        sessionStorage.setItem(ORIGIN_KEY, `${setSlug}/${currentId}`);
        router.push(`/work/${setSlug}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, setSlug, currentId, prevId, nextId]);

  return (
    <nav
      className="mx-[var(--margin)] flex items-baseline justify-between gap-6 border-b border-hairline pb-4"
      aria-label={`${setTitle} — frame navigation`}
    >
      <Link
        href={`/work/${setSlug}`}
        className="tap type-meta t-color text-mid hover:text-hi"
        onClick={remember}
      >
        ← back to {setTitle}
      </Link>
      <div className="flex items-baseline gap-6">
        <p className="type-meta text-low" aria-live="polite">{position}</p>
        <div className="flex gap-4">
          {prevId ? (
            <Link href={`/work/${setSlug}/${prevId}`} replace className="tap type-meta t-color text-mid hover:text-hi" aria-label="Previous frame">
              prev
            </Link>
          ) : (
            <span className="type-meta text-low/50" aria-hidden="true">prev</span>
          )}
          {nextId ? (
            <Link href={`/work/${setSlug}/${nextId}`} replace className="tap type-meta t-color text-mid hover:text-hi" aria-label="Next frame">
              next
            </Link>
          ) : (
            <span className="type-meta text-low/50" aria-hidden="true">next</span>
          )}
        </div>
      </div>
    </nav>
  );
}
