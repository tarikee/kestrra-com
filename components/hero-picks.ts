import { getAllSets } from "@/lib/work";
import { path, type Lang } from "@/lib/i18n";
import type { HeroSlide } from "./hero-frame";

/**
 * The frames that come out of the smoke on the first screen, in order. One
 * from each of five bodies of work, the best of the best, each opening its set.
 *
 * Horizontal frames only: a portrait frame crops badly in the wide hero.
 *
 * The order is a colour walk: red stage light, a gold room, forest green and
 * violet, a red car in the street, blue floor light, a Zagreb sky, amber bar
 * light, blue dusk, daylight, then a lecture hall, so no
 * two neighbours share a colour, the loop seam included. No walk or protest
 * frames here (his rule): those sets stay in /sets.
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
  flip?: boolean;
}[] = [
  { set: "dragons-mark", id: "04480", focus: { x: 88, y: 28 } },
  { set: "riviera", id: "9741", focus: { x: 50, y: 40 } },
  { set: "cyphercat", id: "0611", focus: { x: 40, y: 50 } },
  { set: "riviera", id: "9214", focus: { x: 32, y: 62 }, flip: true },
  { set: "urban-sport-fest", id: "09274", focus: { x: 45, y: 55 } },
  { set: "zagreb", id: "0576", focus: { x: 60, y: 45 } },
  { set: "cocktail-night", id: "00574", focus: { x: 50, y: 40 } },
  { set: "portraits", id: "01192", focus: { x: 35, y: 25 }, wide: { x: 0, y: 25 }, fade: 50 },
  { set: "wedding-day", id: "03492", focus: { x: 50, y: 30 } },
  { set: "winter-case", id: "2585", focus: { x: 62, y: 45 }, wide: { x: 100, y: 45 }, fade: 45 },
];

export function heroSlides(lang: Lang): HeroSlide[] {
  const sets = getAllSets(lang);
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
        flip: p.flip,
        title: set.def.title,
        href: path(lang, `/sets/${set.def.slug}`),
        spill: set.spill,
      },
    ];
  });
}
