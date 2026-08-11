export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-[16svh] border-t border-hairline px-[var(--margin)] py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <p className="type-meta-sm text-low">
          © {new Date().getFullYear()} Kestrra · All rights reserved
        </p>
        <div className="flex items-baseline gap-7">
          <a
            href="https://instagram.com/kestrra"
            rel="noopener"
            className="tap t-color type-meta-sm text-mid hover:text-hi"
          >
            @kestrra ↗
          </a>
          <a
            href="/inquiry"
            className="tap t-color type-meta-sm text-mid hover:text-hi"
          >
            inquire
          </a>
        </div>
      </div>
    </footer>
  );
}
