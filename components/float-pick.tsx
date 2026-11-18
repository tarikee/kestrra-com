"use client";

import { ORIGIN_KEY } from "./restore-focus";
import { plainClick } from "./back-link";

/**
 * One of the photographs floating around a set's row. The row is one link to
 * the set; a click on this one notes which photo it was, so the set opens at
 * that photo, lit for a moment, instead of at its top.
 */
export function FloatPick({ slug, id, children }: { slug: string; id: string; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-auto"
      onClick={(e) => {
        if (!plainClick(e)) return;
        try {
          sessionStorage.setItem(ORIGIN_KEY, `${slug}/${id}/lit`);
        } catch {
          // no storage: the set opens at its top, as the main photo does
        }
      }}
    >
      {children}
    </div>
  );
}
