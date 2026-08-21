/**
 * Gallery-only content (DESIGN.md §8c).
 *
 * The wall shows every frame that ships. Almost all of them are already
 * authored in content/sets.ts and arrive with their alt text and their set;
 * these are the few that are encoded and on disk but belong to no set. They
 * are not being smuggled into a set — Tarik curated those — so they carry
 * their alt here and appear on the wall unattached.
 */

export interface LooseFrame {
  pool: string;
  id: string;
  alt: string;
  /** shown in the reading slot in place of a set title */
  context: string;
}

export const LOOSE: LooseFrame[] = [
  {
    pool: "doa",
    id: "00814",
    context: "Portraits — outtake",
    alt: "Man in a cream tracksuit walking across a paved plaza at dusk, glass and red-panelled office blocks behind him",
  },
  {
    pool: "doa",
    id: "00903",
    context: "Portraits — outtake",
    alt: "The same man seated on a bench with one arm over the backrest, the office blocks and the last of the dusk sky behind",
  },
  {
    pool: "fon",
    id: "0475",
    context: "FON — outtake",
    alt: "Over the shoulders of a lecture-hall audience, a steel water bottle on the desk edge in focus and the room falling away behind it",
  },
];
