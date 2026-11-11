import { getAllSets } from "@/lib/work";
import type { HeroSlide } from "./hero-frame";

/**
 * The frames that come out of the smoke on the first screen, in order. One
 * from each of five bodies of work, the best of the best, each opening its set.
 *
 * The order is a colour walk: red stage light, a gold room, blue dusk, red
 * flare smoke, then amber bar light, so no two neighbours share a colour, the
 * loop seam included. The protest frame never opens.
 *
 * `focus` is the point a phone's narrow crop keeps; `wide` the one for the
 * desktop crop, when it differs. `fade` pulls the desktop frame out of the
 * smoke sooner, for a subject that stands on the left of its picture.
 *
 * A studio portrait goes in the same way once it is through the image
 * pipeline, at the front for a fixed opener. A slide without an `href`
 * shows its title and no button.
 */
const PICKS: {
  set: string;
  id: string;
  focus: { x: number; y: number };
  wide?: { x: number; y: number };
  fade?: number;
}[] = [
  { set: "2hot4stage", id: "04480", focus: { x: 88, y: 28 } },
  { set: "riviera", id: "9741", focus: { x: 50, y: 40 } },
  { set: "portraits", id: "01192", focus: { x: 35, y: 25 }, wide: { x: 0, y: 25 }, fade: 50 },
  { set: "night-protests", id: "2186", focus: { x: 55, y: 55 } },
  { set: "cocktail-night", id: "00574", focus: { x: 50, y: 40 } },
];

export function heroSlides(): HeroSlide[] {
  const sets = getAllSets();
  return PICKS.flatMap((p, i) => {
    const set = sets.find((s) => s.def.slug === p.set);
    const img = set?.images.find((im) => im.id === p.id);
    if (!set || !img) return [];
    return [
      {
        // only the first frame paints before it loads; the rest are fetched
        // ahead of their turn, so their thumbhash would be dead weight
        img: i === 0 ? img : { ...img, thumb: "" },
        focus: p.focus,
        wide: p.wide,
        fade: p.fade,
        title: set.def.title,
        href: `/work/${set.def.slug}`,
        spill: set.spill,
      },
    ];
  });
}
