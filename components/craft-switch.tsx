"use client";

import { Link } from "next-view-transitions";
import { useDict, useHref } from "@/components/lang";

/**
 * photo · dev — the two doors, side by side, the current one underlined in
 * ink. Plain links: both pages stand on their own URL, nothing is hidden
 * behind a toggle. Inside a MetaLight the two words take the light.
 */
export function CraftSwitch({ current, className }: { current: "photo" | "dev"; className?: string }) {
  const c = useDict().film.craft;
  const href = useHref();
  const doors = [
    { key: "photo", label: c.photo, href: href("/") },
    { key: "dev", label: c.dev, href: href("/dev") },
  ] as const;

  return (
    <nav aria-label={c.label} className={`craft-switch type-meta-sm ${className ?? ""}`}>
      {doors.map((d, i) => (
        <span key={d.key} className="contents">
          {i > 0 && (
            <span className="text-low" aria-hidden="true">
              ·
            </span>
          )}
          {d.key === current ? (
            <Link href={d.href} aria-current="page" className="craft-door t-color text-hi" data-on="" data-lit>
              {d.label}
            </Link>
          ) : (
            <Link href={d.href} className="craft-door t-color text-mid hover:text-hi" data-lit>
              {d.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
