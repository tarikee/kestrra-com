import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import { SiteNav } from "@/components/nav";
import { SiteFooter } from "@/components/footer";
import { Ground } from "@/components/ground";
import { SpillDriver } from "@/components/spill-driver";
import { FloatingBack } from "@/components/floating-back";
import "./globals.css";

const grotesk = localFont({
  src: "../public/fonts/OverusedGrotesk-VF.woff2",
  variable: "--font-grotesk",
  weight: "300 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

const fragment = localFont({
  src: "../public/fonts/FragmentMono-Regular.woff2",
  variable: "--font-fragment",
  weight: "400",
  display: "swap",
  fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kestrra.com"),
  title: {
    default: "Kestrra — Photo · Video · Digital Art",
    template: "%s — Kestrra",
  },
  description:
    "Wedding and event photography with colour as the signature. Europe-based. DM or write for business inquiries.",
  openGraph: {
    siteName: "Kestrra",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#08090A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${grotesk.variable} ${fragment.variable}`}>
        <body className="bg-ground text-hi antialiased">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ground focus:px-4 focus:py-2 type-meta"
          >
            skip to content
          </a>
          {/* order matters: the spill paints first, the ground's silver over
              it, then everything else. Both are z-2, so it is tree order. */}
          <SpillDriver />
          <Ground />
          <SiteNav />
          <div id="main" className="relative z-10">
            {children}
          </div>
          <FloatingBack />
          <SiteFooter />
        </body>
      </html>
    </ViewTransitions>
  );
}
