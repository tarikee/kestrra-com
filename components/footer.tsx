import { InstagramMark } from "@/components/instagram-mark";
import { MetaLight } from "@/components/letter-light";

const DOORS = [
  { href: "/work", label: "work" },
  { href: "/dev", label: "dev" },
  { href: "/inquiry", label: "inquire" },
  { href: "https://instagram.com/kestrra", label: "@kestrra", ig: true },
] as const;

/**
 * Who and where on the left, the doors on the right, one baseline between
 * them; the © line underneath, with privacy beside it. The whole footer is
 * one light field, the same as a set's plate.
 */
export function SiteFooter() {
  return (
    <footer className="site-foot relative z-10 mt-[16svh] border-t border-hairline px-[var(--margin)] pb-10 pt-8">
      <MetaLight className="type-meta-sm grid gap-y-6 md:grid-cols-12 md:items-baseline md:gap-x-[2.5vw]">
        <p className="m-0 md:col-span-6">
          <span className="text-mid" data-lit>
            Tarik Ramadani
          </span>
          <span className="text-low" aria-hidden="true">
            {" · "}
          </span>
          <span className="text-low" data-lit>
            Belgrade, Serbia
          </span>
          <span className="hidden text-low md:inline" aria-hidden="true">
            {" · "}
          </span>
          <a
            data-selectable
            href="mailto:hello@kestrra.com"
            className="dev-link t-color mt-2 block w-fit md:mt-0 md:inline"
            data-lit
          >
            hello@kestrra.com
          </a>
        </p>

        <nav aria-label="Footer" className="md:col-span-6 md:justify-self-end">
          <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-6 gap-y-3 p-0">
            {DOORS.map((d) => (
              <li key={d.href}>
                <a
                  href={d.href}
                  rel={d.href.startsWith("http") ? "noopener" : undefined}
                  className={`tap t-color text-mid hover:text-hi ${"ig" in d ? "ig-link" : ""}`}
                  data-lit
                >
                  {"ig" in d && <InstagramMark className="ig-glyph" />}
                  {d.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4 md:col-span-12">
          <p className="m-0 text-low" data-lit>
            © {new Date().getFullYear()} Kestrra · All rights reserved
          </p>
          <a href="/privacy" className="tap t-color text-mid hover:text-hi" data-lit>
            privacy
          </a>
        </div>
      </MetaLight>
    </footer>
  );
}
