"use client";

/**
 * The way back up — a rule and a word, bottom right.
 *
 * This was a glass puck: a circle with a backdrop-filter, a bevelled rim, two
 * specular highlights and a drop shadow. It was the only radius on the site,
 * the only shadow, and the only piece of simulated material anywhere in it —
 * so however carefully it was made, it read as borrowed from another product.
 *
 * The site's own vocabulary is a hairline and a line of mono, and light is
 * how it shows state. So the control is a hairline that *fills* with the
 * distance you have travelled, and the word under it. Same information as the
 * rising meniscus, in the language the rest of the room already speaks.
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
      className="to-top"
    >
      <span className="to-top-rule" aria-hidden="true">
        <span className="to-top-fill" />
      </span>
      <span className="to-top-label type-meta-sm">top ↑</span>
    </button>
  );
}
