import { NextResponse, type NextRequest } from "next/server";

/**
 * One address: www goes to the bare domain, path and query kept. This lives
 * here rather than in next.config redirects, whose full-URL destination went
 * out on Cloudflare with a literal ":path*" in it.
 */
export function middleware(req: NextRequest) {
  if (req.headers.get("host") === "www.kestrra.com") {
    const to = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://kestrra.com");
    return NextResponse.redirect(to, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
