"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Link, useTransitionRouter } from "next-view-transitions";

/** this tab's way through the site, oldest first, kept in step with its history */
const KEY = "kestrra:trail";

/** set just before a navigation that takes the current page's place */
let replacing = false;

function read(): string[] {
  try {
    const v: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
}

function write(trail: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(trail.slice(-40)));
  } catch {
    // storage refused: the links keep their fixed places
  }
}

/** the set a frame page belongs to (/sets/a/b → /sets/a), or null */
function setOf(path: string) {
  return /^\/sets\/[^/]+\/[^/]+$/.test(path) ? path.slice(0, path.lastIndexOf("/")) : null;
}

/**
 * Follows the visitor through the site so "back" can mean back. Stepping
 * from frame to frame takes the frame's place (the steps replace history),
 * returning to the page before pops, anything else adds a page. A fresh
 * arrival from another site starts a new trail; a reload keeps it.
 */
export function PathTrail() {
  const path = usePathname();
  const first = useRef(true);

  useEffect(() => {
    let trail = read();
    if (first.current) {
      first.current = false;
      try {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        const fromHere = !!document.referrer && new URL(document.referrer).origin === location.origin;
        if (nav?.type === "navigate" && !fromHere) trail = [];
      } catch {
        trail = [];
      }
    }
    const top = trail[trail.length - 1];
    if (top === path) {
      // a reload, or the first page of the trail coming back
    } else if (top && (replacing || (setOf(top) !== null && setOf(top) === setOf(path)))) {
      trail[trail.length - 1] = path;
    } else if (trail[trail.length - 2] === path) {
      trail.pop();
    } else {
      trail.push(path);
    }
    replacing = false;
    write(trail);
  }, [path]);

  return null;
}

/**
 * Up one level, to `to`: back through history when that is the page this
 * one was opened from, otherwise to `to` in this page's place. Either way
 * the browser's own back never returns here.
 */
export function useUp() {
  const router = useTransitionRouter();
  return useCallback(
    (to: string) => {
      const trail = read();
      if (trail[trail.length - 2] === to && history.length > 1) {
        history.back();
        return;
      }
      replacing = true;
      router.replace(to);
    },
    [router],
  );
}

/** a plain left click, the kind a link can take over without surprising anyone */
export function plainClick(e: React.MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/**
 * "← back" to wherever the visitor came from on this site (the home page,
 * the index, another set) and the fixed place under its own name when they
 * arrived straight here.
 */
export function BackLink({ fallback, label, className }: { fallback: string; label: string; className?: string }) {
  const [back, setBack] = useState(false);

  useEffect(() => {
    // a turn later, once the trail has noted this page
    const t = setTimeout(() => {
      const trail = read();
      const prev = trail[trail.length - 2];
      const here = location.pathname;
      // never "back" into one of this page's own frames
      setBack(!!prev && prev !== here && !prev.startsWith(`${here}/`) && history.length > 1);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <Link
      href={fallback}
      className={className}
      data-lit
      onClick={(e) => {
        if (!back || !plainClick(e)) return;
        e.preventDefault();
        history.back();
      }}
    >
      {back ? "← back" : label}
    </Link>
  );
}
