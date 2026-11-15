/**
 * Who the work was for, in the order the home page shows them.
 *
 * Marks are luminance-only SVGs in public/brand (white, never brand colour,
 * DESIGN.md §8b) with their viewBox size, which the row uses to size every
 * mark to the same visual weight. A client with no mark of its own is set in
 * type. `href` points at the work done for them on this site.
 */
export interface Client {
  name: string;
  mark?: { src: string; w: number; h: number };
  href?: string;
}

export const CLIENTS: Client[] = [
  { name: "Red Bull Serbia", mark: { src: "/brand/clients/redbull.svg", w: 225, h: 36 } },
  { name: "Olympic Committee of Serbia", mark: { src: "/brand/clients/oks.svg", w: 348.8, h: 602.9 } },
  { name: "IDJ Videos", mark: { src: "/brand/clients/idj.svg", w: 2127, h: 664 } },
  { name: "Bassivity Music", mark: { src: "/brand/clients/bassivity.svg", w: 730, h: 907 } },
  { name: "2Hot4Stage", mark: { src: "/brand/2h4s-logo.svg", w: 1200, h: 400 }, href: "/work/2hot4stage" },
  {
    name: "Apartment Renovation NYC",
    mark: { src: "/brand/clients/apartment-renovation-nyc.svg", w: 278.4, h: 94.3 },
    href: "/dev#apartment-renovation-nyc",
  },
  { name: "Lenka Ilić Architecture" },
];
