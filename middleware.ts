import { NextResponse, type NextRequest } from "next/server";

/**
 * One address for everything: www goes to the bare domain, and the old /work
 * addresses (the index and every set and photo under it) go to /sets, path
 * after it and query kept, in a single permanent hop. This lives here rather
 * than in next.config redirects, whose full-URL destination went out on
 * Cloudflare with a literal ":path*" in it.
 */
export function middleware(req: NextRequest) {
  const www = req.headers.get("host") === "www.kestrra.com";
  const { pathname, search } = req.nextUrl;
  const moved = pathname === "/work" || pathname.startsWith("/work/");
  if (!www && !moved) return NextResponse.next();

  const path = moved ? `/sets${pathname.slice("/work".length)}` : pathname;
  const base = www ? "https://kestrra.com" : req.nextUrl.origin;
  return NextResponse.redirect(new URL(path + search, base), 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
