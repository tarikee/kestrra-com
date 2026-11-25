import type { Lang } from "@/lib/i18n";
import { common as common_en } from "./en/common";
import { notFound as notFound_en } from "./en/notFound";
import { home as home_en } from "./en/home";
import { sets as sets_en } from "./en/sets";
import { set as set_en } from "./en/set";
import { piece as piece_en } from "./en/piece";
import { gallery as gallery_en } from "./en/gallery";
import { film as film_en } from "./en/film";
import { dev as dev_en } from "./en/dev";
import { about as about_en } from "./en/about";
import { inquiry as inquiry_en } from "./en/inquiry";
import { privacy as privacy_en } from "./en/privacy";
import { license as license_en } from "./en/license";
import { meta as meta_en } from "./en/meta";
import { common as common_sr } from "./sr/common";
import { notFound as notFound_sr } from "./sr/notFound";
import { home as home_sr } from "./sr/home";
import { sets as sets_sr } from "./sr/sets";
import { set as set_sr } from "./sr/set";
import { piece as piece_sr } from "./sr/piece";
import { gallery as gallery_sr } from "./sr/gallery";
import { film as film_sr } from "./sr/film";
import { dev as dev_sr } from "./sr/dev";
import { about as about_sr } from "./sr/about";
import { inquiry as inquiry_sr } from "./sr/inquiry";
import { privacy as privacy_sr } from "./sr/privacy";
import { license as license_sr } from "./sr/license";
import { meta as meta_sr } from "./sr/meta";

const en = { common: common_en, notFound: notFound_en, home: home_en, sets: sets_en, set: set_en, piece: piece_en, gallery: gallery_en, film: film_en, dev: dev_en, about: about_en, inquiry: inquiry_en, privacy: privacy_en, license: license_en, meta: meta_en };
const sr: typeof en = { common: common_sr, notFound: notFound_sr, home: home_sr, sets: sets_sr, set: set_sr, piece: piece_sr, gallery: gallery_sr, film: film_sr, dev: dev_sr, about: about_sr, inquiry: inquiry_sr, privacy: privacy_sr, license: license_sr, meta: meta_sr };

export type Dict = typeof en;

export function dict(lang: Lang): Dict {
  return lang === "sr" ? sr : en;
}
