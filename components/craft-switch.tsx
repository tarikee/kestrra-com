import { Link } from "next-view-transitions";

/**
 * photo · dev — the two doors, side by side, the current one underlined in
 * ink. Plain links: both pages stand on their own URL, nothing is hidden
 * behind a toggle.
 */
export function CraftSwitch({ current, className }: { current: "photo" | "dev"; className?: string }) {
  const doors = [
    { key: "photo", label: "photo", href: "/" },
    { key: "dev", label: "dev", href: "/dev" },
  ] as const;

  return (
    <nav aria-label="Photo or development" className={`craft-switch type-meta-sm ${className ?? ""}`}>
      {doors.map((d, i) => (
        <span key={d.key} className="contents">
          {i > 0 && (
            <span className="text-low" aria-hidden="true">
              ·
            </span>
          )}
          {d.key === current ? (
            <Link href={d.href} aria-current="page" className="craft-door t-color text-hi" data-on="">
              {d.label}
            </Link>
          ) : (
            <Link href={d.href} className="craft-door t-color text-mid hover:text-hi">
              {d.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
