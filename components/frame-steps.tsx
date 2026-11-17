"use client";

import { useRef } from "react";
import { Link, useTransitionRouter } from "next-view-transitions";

type Steps = { setSlug: string; prevId: string | null; nextId: string | null };

const href = (setSlug: string, id: string | null) => (id ? `/sets/${setSlug}/${id}` : null);

/**
 * The photo with its way through the set made plain: a large arrow either
 * side of it on a wide screen, two broad buttons under it on a phone, and a
 * swipe across it. Steps replace the history entry, as the arrow keys do, so
 * back still leaves the photo for the set.
 */
export function FrameSteps({ setSlug, prevId, nextId, children }: Steps & { children: React.ReactNode }) {
  const router = useTransitionRouter();
  const start = useRef<{ x: number; y: number } | null>(null);
  const prev = href(setSlug, prevId);
  const next = href(setSlug, nextId);

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const to = dx < 0 ? next : prev;
    if (to) router.replace(to);
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-[var(--margin)] py-6">
      <div
        className="flex items-center justify-center gap-[2vw]"
        onTouchStart={(e) => {
          const t = e.touches[0];
          start.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={onTouchEnd}
      >
        <Side to={prev} label="Previous photo" glyph="←" />
        {children}
        <Side to={next} label="Next photo" glyph="→" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:hidden">
        <Bar to={prev} label="Previous photo">
          ← previous
        </Bar>
        <Bar to={next} label="Next photo" end>
          next →
        </Bar>
      </div>
    </div>
  );
}

function Side({ to, label, glyph }: { to: string | null; label: string; glyph: string }) {
  if (!to)
    return (
      <span className="frame-step is-off hidden md:flex" aria-hidden="true">
        {glyph}
      </span>
    );
  return (
    <Link href={to} replace className="frame-step hidden md:flex" aria-label={label}>
      {glyph}
    </Link>
  );
}

function Bar({ to, label, end, children }: { to: string | null; label: string; end?: boolean; children: React.ReactNode }) {
  const cls = `frame-step-bar type-meta${end ? " justify-end" : ""}`;
  if (!to)
    return (
      <span className={`${cls} is-off`} aria-hidden="true">
        {children}
      </span>
    );
  return (
    <Link href={to} replace className={cls} aria-label={label}>
      {children}
    </Link>
  );
}

/**
 * The two halves of the picture, as people expect of a photo: the left one
 * steps back, the right one on. Invisible; the arrows and the keys carry the
 * same steps for anyone who cannot point.
 */
export function FrameTapZones({ setSlug, prevId, nextId }: Steps) {
  const prev = href(setSlug, prevId);
  const next = href(setSlug, nextId);
  return (
    <>
      {prev && <Link href={prev} replace tabIndex={-1} aria-hidden="true" className="frame-zone frame-zone-prev" />}
      {next && <Link href={next} replace tabIndex={-1} aria-hidden="true" className="frame-zone frame-zone-next" />}
    </>
  );
}
