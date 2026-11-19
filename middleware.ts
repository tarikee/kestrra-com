import { NextResponse, type NextRequest } from "next/server";

/**
 * One address for everything: www goes to the bare domain, and the old /work
 * addresses (the index and every set and photo under it) go to /sets, path
 * after it and query kept, in a single permanent hop. This lives here rather
 * than in next.config redirects, whose full-URL destination went out on
 * Cloudflare with a literal ":path*" in it.
 *
 * Sets that were renamed keep their old address the same way.
 */
const RENAMED: Record<string, string> = { "2hot4stage": "dragons-mark" };

export function middleware(req: NextRequest) {
  const www = req.headers.get("host") === "www.kestrra.com";
  const { pathname, search } = req.nextUrl;
  const moved = pathname === "/work" || pathname.startsWith("/work/");
  let path = moved ? `/sets${pathname.slice("/work".length)}` : pathname;
  const [, root, set, ...rest] = path.split("/");
  const renamed = root === "sets" && Object.hasOwn(RENAMED, set ?? "");
  if (renamed) path = ["", root, RENAMED[set], ...rest].join("/");
  if (!www && !moved && !renamed) return NextResponse.next();

  const base = www ? "https://kestrra.com" : req.nextUrl.origin;
  return NextResponse.redirect(new URL(path + search, base), 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
