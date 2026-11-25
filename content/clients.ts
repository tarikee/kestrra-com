/**
 * Who the work was for, in the order the home page shows them.
 *
 * Marks are luminance-only SVGs in public/brand (white, never brand colour,
 * DESIGN.md §8b) with their viewBox size, which the row uses to size every
 * mark to the same visual weight. `href` points at the work done for them on
 * this site.
 */
export interface Client {
  name: string;
  /** `area` scales the shared mark area, for a mark that is mostly small text. */
  mark: { src: string; w: number; h: number; area?: number };
  href?: string;
}

export const CLIENTS: Client[] = [
  { name: "Red Bull Serbia", mark: { src: "/brand/clients/redbull.svg", w: 225, h: 36 }, href: "https://www.redbull.com/rs-sr" },
  { name: "Olympic Committee of Serbia", mark: { src: "/brand/clients/oks.svg", w: 348.8, h: 602.9 }, href: "https://oks.org.rs/cyr/" },
  { name: "IDJ Videos", mark: { src: "/brand/clients/idj.svg", w: 2127, h: 664 }, href: "/film#bubili" },
  { name: "Bassivity Music", mark: { src: "/brand/clients/bassivity.svg", w: 730, h: 907 }, href: "/film#nanogica" },
  { name: "2Hot4Stage", mark: { src: "/brand/2h4s-logo.svg", w: 1200, h: 400 }, href: "/sets/dragons-mark" },
  {
    name: "Apartment Renovation NYC",
    mark: { src: "/brand/clients/apartment-renovation-nyc.svg", w: 278.4, h: 94.3 },
    href: "/dev#apartment-renovation-nyc",
  },
  {
    name: "ELMINA · Društvo za mikrostrukturna i nanostrukturna istraživanja Srbije",
    mark: { src: "/brand/clients/elmina.svg", w: 880, h: 230 },
    href: "https://elmina.rs",
  },
  {
    name: "Elite Restaurant & Club, Zürich",
    mark: { src: "/brand/clients/elite.svg", w: 1035, h: 431 },
    href: "https://www.instagram.com/eliteclub_zh/",
  },
  {
    name: "Studentska asocijacija FON-a",
    mark: { src: "/brand/clients/sa-fon.svg", w: 1216, h: 1063 },
    href: "/sets/winter-case",
  },
];
