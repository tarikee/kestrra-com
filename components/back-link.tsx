"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

/** the page before this one, within the site, for this tab */
const KEY = "kestrra:prev";

/**
 * Notes each page as the visitor leaves it, so a back link can mean "back"
 * rather than a fixed place. A fresh arrival from another site starts a new
 * trail; a reload keeps it.
 */
export function PathTrail() {
  const path = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (last.current === null) {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        const fromHere = !!document.referrer && new URL(document.referrer).origin === location.origin;
        if (nav?.type === "navigate" && !fromHere) sessionStorage.removeItem(KEY);
      } else if (last.current !== path) {
        sessionStorage.setItem(KEY, last.current);
      }
    } catch {
      // storage refused: the links keep their fixed place
    }
    last.current = path;
  }, [path]);

  return null;
}

/**
 * "← back" to wherever the visitor came from on this site — the home page,
 * the index, another set — and the fixed place under its own name when they
 * arrived straight here.
 */
export function BackLink({ fallback, label, className }: { fallback: string; label: string; className?: string }) {
  const [back, setBack] = useState(false);

  useEffect(() => {
    // a turn later, once the trail has noted the page just left
    const t = setTimeout(() => {
      try {
        const prev = sessionStorage.getItem(KEY);
        setBack(!!prev && prev !== location.pathname && history.length > 1);
      } catch {
        setBack(false);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <Link
      href={fallback}
      className={className}
      data-lit
      onClick={(e) => {
        if (!back) return;
        e.preventDefault();
        history.back();
      }}
    >
      {back ? "← back" : label}
    </Link>
  );
}
