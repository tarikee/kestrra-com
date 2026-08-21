"use client";

/**
 * The way back up — one glass puck, bottom right.
 *
 * It is a lens, not a button: `backdrop-filter` means it refracts the ground
 * behind it, so it takes the colour of whichever set you are standing in.
 * That keeps it inside the rule that colour only ever comes from the work —
 * the puck carries none of its own.
 *
 * It fills as the page runs under you: a meniscus of light rising to the top
 * of the disc at the bottom of the document, so it reads the position as well
 * as offering the way out of it. Appears once the hero is behind you and
 * stands down as you approach the top again.
 */
import { useEffect, useRef, useState } from "react";
import { lenis } from "@/components/smooth-scroll";

export function ToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      el.style.setProperty("--progress", max > 0 ? String(Math.min(1, y / max)) : "0");
      setShown(y > window.innerHeight * 1.15);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const up = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Native smooth scroll and Lenis would run the same journey twice, at
    // two different rates. When Lenis is up, it owns the trip.
    const smooth = lenis();
    if (smooth && !reduced) smooth.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={up}
      aria-label="Back to top"
      data-shown={shown}
      tabIndex={shown ? 0 : -1}
      className="to-top fixed right-5 z-40 grid h-14 w-14 cursor-pointer place-items-center overflow-hidden rounded-full text-hi"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <span className="to-top-fill" aria-hidden="true" />
      <span className="to-top-spec" aria-hidden="true" />
      <svg
        className="relative h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.45))" }}
      >
        <path
          d="M8 13.5V3M8 3L3.5 7.5M8 3l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
