import { InstagramMark } from "@/components/instagram-mark";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-[16svh] border-t border-hairline px-[var(--margin)] py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <div className="flex flex-col gap-y-2">
          <p className="type-meta-sm text-mid">
            Tarik Ramadani · Belgrade, Serbia ·{" "}
            <a
              data-selectable
              href="mailto:hello@kestrra.com"
              className="t-color hover:text-hi"
            >
              hello@kestrra.com
            </a>
          </p>
          <p className="type-meta-sm text-low">
            © {new Date().getFullYear()} Kestrra · All rights reserved
          </p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-7 gap-y-3">
          <a href="/work" className="tap t-color type-meta-sm text-mid hover:text-hi">
            work
          </a>
          <a href="/dev" className="tap t-color type-meta-sm text-mid hover:text-hi">
            dev
          </a>
          <a
            href="https://instagram.com/kestrra"
            rel="noopener"
            className="ig-link tap t-color type-meta-sm text-mid hover:text-hi"
          >
            <InstagramMark className="ig-glyph" />
            @kestrra
          </a>
          <a
            href="/inquiry"
            className="tap t-color type-meta-sm text-mid hover:text-hi"
          >
            inquire
          </a>
          <a href="/privacy" className="tap t-color type-meta-sm text-low hover:text-hi">
            privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
