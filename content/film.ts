/**
 * The music videos on /film, in the order the page shows them.
 *
 * The camera files were not kept, so every still is a frame taken from the
 * published video, and its log view is rebuilt from that graded frame
 * (S-Log3, S-Gamut3.Cine) by the pipeline. The stills live in
 * data/generated/images.json under `film-<slug>`; lib/film.ts joins them.
 * The log view is never to be presented as the original footage.
 */
export interface FilmDef {
  slug: string;
  artist: string;
  title: string;
  /** featured artists, shown as their own line of the slip */
  feat?: string;
  /** the channel that published it */
  channel: string;
  year: string;
  /** Tarik's part in it */
  role: string;
  /** everyone else named on the work */
  credits?: string;
  /** the YouTube video id */
  youtube: string;
}

export const FILMS: FilmDef[] = [
  {
    slug: "bubili",
    artist: "Mahrina",
    title: "Bubili",
    channel: "IDJVideos.TV",
    year: "2024",
    role: "Colour grade",
    credits: "Video: debbug production",
    youtube: "TuMf15fPGbY",
  },
  {
    slug: "nanogica",
    artist: "Steffan",
    title: "Nanogica",
    channel: "Bassivity Digital",
    year: "2024",
    role: "Edit and colour grade",
    credits: "Video: debbug production",
    youtube: "fepFA08NO6M",
  },
  {
    slug: "losa-kopija",
    artist: "DJ Shone x Anabela",
    title: "Loša kopija",
    channel: "DJ Shone",
    year: "2025",
    role: "Colour grade",
    credits: "Director of photography and edit: Nikola Šunjević, Gavrilo Sandulović",
    youtube: "GkxnPwsuxeM",
  },
  {
    slug: "ne-zovi",
    artist: "CXFI",
    title: "Ne zovi",
    channel: "MForce",
    year: "2026",
    role: "Music video with CXFI: director of photography, camera, colour grade",
    youtube: "tO9ivbK6TYM",
  },
  {
    slug: "cypher-1",
    artist: "MForce",
    title: "Cypher #1",
    feat: "Bubanj Blok, lexxa, 808MARE",
    channel: "MForce",
    year: "2024",
    role: "Music video with CXFI: director of photography, camera, colour grade",
    youtube: "gLgpU8Yna50",
  },
  {
    slug: "avio-rezim",
    artist: "MForce x markica",
    title: "Avio-režim",
    channel: "MForce",
    year: "2023",
    role: "Director of photography, camera, colour grade",
    credits: "Also shot by Filip Drageljević and CXFI. Edit and colour correction: CXFI",
    youtube: "yKYQUlQTxQ4",
  },
  {
    slug: "arab-flow",
    artist: "MForce",
    title: "Arab Flow",
    feat: "markica",
    channel: "MForce",
    year: "2023",
    role: "Director of photography, camera, colour grade",
    credits: "Also shot by Filip Drageljević and CXFI. Edit and colour correction: CXFI",
    youtube: "OuwHGamG8ZE",
  },
];

/** "Mahrina — Bubili", "MForce — Arab Flow (ft. markica)" */
export const filmName = (f: FilmDef) =>
  `${f.artist} — ${f.title}${f.feat ? ` (ft. ${f.feat})` : ""}`;
