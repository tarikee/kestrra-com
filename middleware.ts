import { NextResponse, type NextRequest } from "next/server";
import { enFolder, SLUGS } from "@/lib/i18n";

/**
 * One address for everything: www goes to the bare domain, and the old /work
 * addresses (the index and every set and photo under it) go to /sets, path
 * after it and query kept, in a single permanent hop. This lives here rather
 * than in next.config redirects, whose full-URL destination went out on
 * Cloudflare with a literal ":path*" in it.
 *
 * Sets that were renamed keep their old address the same way.
 *
 * Languages: English lives at the bare path and is served from /en; Serbian
 * lives under /sr with its own words (/sr/setovi) and is served from the
 * English folder names underneath. /en/... typed directly goes to the bare
 * path, so there is one address per page.
 */
const RENAMED: Record<string, string> = { "2hot4stage": "dragons-mark" };

export function middleware(req: NextRequest) {
  const www = req.headers.get("host") === "www.kestrra.com";
  const { pathname, search } = req.nextUrl;

  const sr = pathname === "/sr" || pathname.startsWith("/sr/");
  const parts = (sr ? pathname.slice(3) : pathname).split("/"); // ["", folder, ...]
  const [, first, second] = parts;

  let changed = false;
  if (first === "work") {
    parts[1] = sr ? SLUGS.sets : "sets";
    changed = true;
  }
  const isSets = sr ? parts[1] === SLUGS.sets : parts[1] === "sets";
  if (isSets && second && Object.hasOwn(RENAMED, second)) {
    parts[2] = RENAMED[second];
    changed = true;
  }
  const fixed = (sr ? "/sr" : "") + parts.join("/");

  // /en and /en/... -> unprefixed
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = fixed.slice(3) || "/";
    return NextResponse.redirect(new URL(rest + search, www ? "https://kestrra.com" : req.nextUrl.origin), 308);
  }

  if (www || changed) {
    const base = www ? "https://kestrra.com" : req.nextUrl.origin;
    return NextResponse.redirect(new URL((fixed || "/") + search, base), 308);
  }

  const url = req.nextUrl.clone();
  if (sr) {
    const word = parts[1];
    if (word) {
      const folder = enFolder(word);
      if (folder) {
        parts[1] = folder;
        url.pathname = "/sr" + parts.join("/");
      } else {
        // an English folder name or an unknown word under /sr: no such page
        url.pathname = "/sr/__404";
      }
    }
    return NextResponse.rewrite(url);
  }
  url.pathname = "/en" + (pathname === "/" ? "" : pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  // skip _next, api and anything with a dot (public files, sitemap.xml,
  // robots.txt, icons, llms.txt)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
