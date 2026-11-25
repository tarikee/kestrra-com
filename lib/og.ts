import type { Lang } from "@/lib/i18n";

/** The Open Graph fields every page shares. A page that sets its own
    openGraph replaces the layout's whole object, so pages spread this in
    instead of setting only the locale; the share image and the large
    Twitter card (derived from it) then survive on every page. */
export function og(lang: Lang) {
  return {
    siteName: "Kestrra",
    locale: lang === "sr" ? "sr_RS" : "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  };
}
