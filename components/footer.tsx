import { Link } from "next-view-transitions";
import { MetaLight } from "@/components/letter-light";
import { SocialLink } from "@/components/social";
import { LangSwitch } from "@/components/lang-switch";
import { dict } from "@/dictionaries";
import { path, type Lang } from "@/lib/i18n";

const DOORS = [
  { href: "/sets", key: "sets" },
  { href: "/gallery", key: "gallery" },
  { href: "/dev", key: "development" },
  { href: "/about", key: "about" },
  { href: "/inquiry", key: "inquire" },
] as const;

/**
 * Who and where on the left, the doors on the right, one baseline between
 * them; the © line underneath, with the site's credit and privacy beside it. The whole footer is
 * one light field, the same as a set's plate.
 */
export function SiteFooter({ lang }: { lang: Lang }) {
  const t = dict(lang).common.footer;
  return (
    <footer className="site-foot relative z-10 mt-[16svh] border-t border-hairline px-[var(--margin)] pb-10 pt-8">
      <MetaLight className="type-meta-sm grid gap-y-6 md:grid-cols-12 md:items-baseline md:gap-x-[2.5vw]">
        <p className="m-0 md:col-span-6">
          <span className="text-mid" data-lit>
            {t.name}
          </span>
          {" "}
          <span className="whitespace-nowrap text-low" data-lit>
            <span aria-hidden="true">· </span>{t.place}
          </span>
          <span className="hidden whitespace-nowrap text-low md:inline" aria-hidden="true">
            {" · "}
          </span>
          <a
            data-selectable
            href="mailto:hello@kestrra.com"
            className="dev-link t-color mt-2 block w-fit py-2 md:mt-0 md:inline"
            data-lit
          >
            hello@kestrra.com
          </a>
        </p>

        <nav aria-label={t.label} className="md:col-span-6 md:justify-self-end">
          <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-6 gap-y-3 p-0">
            {DOORS.map((d) => (
              <li key={d.href}>
                <Link href={path(lang, d.href)} className="dev-link t-color inline-flex min-h-11 items-center" data-lit>
                  {t[d.key]}
                </Link>
              </li>
            ))}
            <li>
              <SocialLink kind="instagram" className="tap t-color min-h-11 text-mid hover:text-hi" data-lit />
              <SocialLink kind="github" className="tap t-color min-h-11 text-mid hover:text-hi" data-lit />
            </li>
            <li>
              <LangSwitch />
            </li>
          </ul>
        </nav>

        <div className="foot-base flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4 md:col-span-12">
          <p className="m-0 text-low" data-lit>
            © {new Date().getFullYear()} {t.name} · Kestrra Studio · {t.rights}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-6">
            {/* the site is my own work too: credited here, not listed on /dev */}
            <Link href={path(lang, "/dev")} className="dev-link t-color inline-flex min-h-11 items-center" data-lit>
              {t.credit}
            </Link>
            <Link href={path(lang, "/privacy")} className="dev-link t-color inline-flex min-h-11 items-center" data-lit>
              {t.privacy}
            </Link>
            <Link href={path(lang, "/license")} className="dev-link t-color inline-flex min-h-11 items-center" data-lit>
              {t.license}
            </Link>
          </div>
        </div>
      </MetaLight>
    </footer>
  );
}
