export type Lang = "en" | "sr";

export const LANGS: readonly Lang[] = ["en", "sr"];

export const isLang = (v: string): v is Lang => v === "en" || v === "sr";

const ORIGIN = "https://kestrra.com";

/** English folder name -> Serbian URL word. */
export const SLUGS: Record<string, string> = {
  sets: "setovi",
  film: "color-grading",
  dev: "sajtovi-i-softver",
  about: "o-meni",
  inquiry: "upit",
  gallery: "galerija",
  privacy: "privatnost",
  license: "licenca",
};

const SR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SLUGS).map(([en, sr]) => [sr, en]),
);

export const enFolder = (srSlug: string): string | undefined =>
  Object.hasOwn(SR_TO_EN, srSlug) ? SR_TO_EN[srSlug] : undefined;

/** Link to an English-structured path ("/sets/x?a=1#h") in the given language. */
export function path(lang: Lang, enPath: string): string {
  if (lang === "en") return enPath;
  const m = /^\/([^/?#]*)(.*)$/.exec(enPath);
  if (!m) return enPath;
  const [, first, tail] = m;
  if (first === "") return "/sr" + tail;
  const word = Object.hasOwn(SLUGS, first) ? SLUGS[first] : first;
  return `/sr/${word}${tail}`;
}

/** Language of a public pathname (as the browser shows it). */
export function langFromPath(pathname: string | null | undefined): Lang {
  const p = pathname ?? "/";
  return p === "/sr" || p.startsWith("/sr/") ? "sr" : "en";
}

/** The English-structured path of a public pathname ("/sr/setovi/x" -> "/sets/x"). */
export function enPathOf(pathname: string): string {
  // pages are prebuilt at their internal address (/en/x); read it as /x
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  if (!(pathname === "/sr" || pathname.startsWith("/sr/"))) return pathname;
  const rest = pathname.slice(3);
  if (rest === "" || rest === "/") return "/";
  const [, first, ...more] = rest.split("/");
  const folder = enFolder(first) ?? first;
  return ["", folder, ...more].join("/");
}

/** The same page in the other language. */
export function counterpart(pathname: string): string {
  const en = enPathOf(pathname);
  return langFromPath(pathname) === "sr" ? en : path("sr", en);
}

/** Language switch target, as seen from the English-structured path. */
export function alternates(enPath: string, lang: Lang) {
  const en = enPath === "/" ? "/" : enPath;
  const sr = path("sr", enPath);
  return {
    canonical: lang === "sr" ? sr : en,
    languages: { en, sr, "x-default": en },
  };
}

export const absolute = (p: string) => ORIGIN + p;

/** "frame {n} of {total}" with the values put in */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export interface Plural {
  one: string;
  few: string;
  other: string;
}

/** "1 frame" / "3 frames" / "5 kadrova": the right form for the count */
export function plural(lang: Lang, n: number, forms: Plural): string {
  const cat = new Intl.PluralRules(lang === "sr" ? "sr-Latn" : "en").select(n);
  const form = cat === "one" ? forms.one : cat === "few" ? forms.few : forms.other;
  return fmt(form, { n });
}
