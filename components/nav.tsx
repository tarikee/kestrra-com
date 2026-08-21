"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark/wordmark";

export function SiteNav() {
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
        <div className="flex items-baseline gap-7">
          <Link href="/#work" className="tap t-color text-mid hover:text-hi">
            Work
          </Link>
          <Link
            href="/gallery"
            className={`tap t-color hover:text-hi ${
              pathname === "/gallery" ? "text-hi" : "text-mid"
            }`}
          >
            Gallery
          </Link>
          <Link href="/#practice" className="tap t-color text-mid hover:text-hi">
            Practice
          </Link>
          <Link href="/inquiry" className="tap t-color text-hi underline decoration-[rgb(255_255_255/0.28)] underline-offset-[6px] hover:decoration-[rgb(255_255_255/0.7)]">
            Inquire
          </Link>
        </div>
      </nav>
    </header>
  );
}
