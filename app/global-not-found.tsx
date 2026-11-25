import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import { SiteNav } from "@/components/nav";
import { Ground } from "@/components/ground";
import { grotesk, fragment } from "@/lib/fonts";
import NotFound from "./[lang]/not-found";
import "./globals.css";

// The language sits at the top of the address, so a missing page can't count
// on the [lang] layout; this one stands on its own and picks its words from
// the address on the client.
export const metadata: Metadata = {
  title: "Not found · Kestrra",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <ViewTransitions>
      <html lang="en" className={`${grotesk.variable} ${fragment.variable}`}>
        <body className="bg-ground text-hi antialiased">
          <Ground />
          <SiteNav />
          <div id="main" className="relative z-10">
            <NotFound />
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
