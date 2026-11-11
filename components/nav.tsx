"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark/wordmark";

/** how long a pointer rests on the button before the panel opens, and how
    long it may wander off before it closes */
const OPEN_AFTER = 120;
const CLOSE_AFTER = 220;

export function SiteNav({ sets, frames }: { sets: number; frames: number }) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header
      className="site-nav fixed inset-x-0 top-0 z-50"
      style={{
        // deep enough that the row stays legible where a photograph runs
        // under it (mobile set views, full-bleed frames)
        background:
          "linear-gradient(to bottom, rgb(8 9 10 / 0.94) 0%, rgb(8 9 10 / 0.86) 46%, rgb(8 9 10 / 0.5) 74%, rgb(8 9 10 / 0) 100%)",
      }}
    >
      <nav
        className="flex items-center justify-between px-[var(--margin)] py-5"
        aria-label="Site"
      >
        <Link
          href="/"
          aria-label="Kestrra — home"
          className={`t-opacity block text-hi ${onHome ? "nav-mark-home" : ""}`}
        >
          <Wordmark className="h-[1.05rem] w-auto" />
        </Link>
        <div className="flex items-baseline gap-[1.05rem] whitespace-nowrap sm:gap-7">
          <PhotoMenu sets={sets} frames={frames} pathname={pathname} />
          <Link
            href="/dev"
            className={`tap t-color hover:text-hi ${
              pathname === "/dev" ? "text-hi" : "text-mid"
            }`}
          >
            <span className="sm:hidden">Dev</span>
            <span className="hidden sm:inline">Development</span>
          </Link>
          <Link
            href="/about"
            className={`tap t-color hover:text-hi ${
              pathname === "/about" ? "text-hi" : "text-mid"
            }`}
          >
            About
          </Link>
          <Link href="/inquiry" className="tap t-color text-hi underline decoration-[rgb(255_255_255/0.28)] underline-offset-[6px] hover:decoration-[rgb(255_255_255/0.7)]">
            Inquire
          </Link>
        </div>
      </nav>
    </header>
  );
}

/**
 * Photo & film — the two ways into the photographs, behind one word.
 *
 * A disclosure, not an application menu: a button and a short list of
 * links. It opens on a resting pointer, on click or tap, and from the
 * keyboard; arrows walk the list, Escape hands focus back to the button,
 * and leaving it in any direction closes it.
 */
function PhotoMenu({
  sets,
  frames,
  pathname,
}: {
  sets: number;
  frames: number;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  // opened by a resting pointer: leaving closes it, a click keeps it
  const byHover = useRef(false);
  const [focusTo, setFocusTo] = useState<"first" | "last" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const items = [
    { href: "/work", label: "Sets", count: sets, unit: "sets", on: pathname === "/work" || pathname.startsWith("/work/") },
    { href: "/gallery", label: "Gallery", count: frames, unit: "frames", on: pathname === "/gallery" },
  ];
  const here = items.some((i) => i.on);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const close = useCallback((refocus = false) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    byHover.current = false;
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const links = () => Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);

  // a new page closes it
  useEffect(() => close(), [pathname, close]);

  // keyboard opening lands on an item once the list is on screen
  useEffect(() => {
    if (!open || !focusTo) return;
    const all = links();
    (focusTo === "first" ? all[0] : all[all.length - 1])?.focus();
    setFocusTo(null);
  }, [open, focusTo]);

  // a press anywhere else closes it
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  useEffect(() => clear, []);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        clear();
        if (open) return;
        timer.current = setTimeout(() => {
          byHover.current = true;
          setOpen(true);
        }, OPEN_AFTER);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        clear();
        if (!open || !byHover.current) return;
        timer.current = setTimeout(() => close(), CLOSE_AFTER);
      }}
      onBlur={(e) => {
        // tabbing out of the button or the last item closes it
        if (open && !wrapRef.current?.contains(e.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === "Escape") {
          e.preventDefault();
          close(true);
          return;
        }
        const all = links();
        const at = all.indexOf(document.activeElement as HTMLAnchorElement);
        let to: number | null = null;
        if (e.key === "ArrowDown") to = at < 0 ? 0 : (at + 1) % all.length;
        else if (e.key === "ArrowUp") to = at < 0 ? all.length - 1 : (at - 1 + all.length) % all.length;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = all.length - 1;
        if (to === null) return;
        e.preventDefault();
        all[to]?.focus();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        className={`tap t-color hover:text-hi ${here || open ? "text-hi" : "text-mid"}`}
        onClick={(e) => {
          clear();
          // Enter or Space: a click with no pointer behind it
          const fromKeys = e.detail === 0;
          if (open && byHover.current && !fromKeys) {
            // the pointer opened it on the way to clicking: keep it open
            byHover.current = false;
            return;
          }
          if (open) return close();
          byHover.current = false;
          setOpen(true);
          if (fromKeys) setFocusTo("first");
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          if (open) return; // the list's own handler walks it
          e.preventDefault();
          clear();
          byHover.current = false;
          setOpen(true);
          setFocusTo(e.key === "ArrowDown" ? "first" : "last");
        }}
      >
        Photo &amp; film
        <span aria-hidden="true" className="nav-menu-caret">
          ▾
        </span>
      </button>

      <div id={id} hidden={!open} className="nav-menu develop">
        <ul ref={listRef} className="m-0 list-none p-0">
          {items.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={pathname === i.href ? "page" : undefined}
                className={`nav-menu-item t-color hover:text-hi ${i.on ? "text-hi" : "text-mid"}`}
                onClick={() => close()}
              >
                <span>{i.label}</span>
                <span className="type-meta-sm text-low">
                  {i.count}
                  <span className="sr-only"> {i.unit}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
