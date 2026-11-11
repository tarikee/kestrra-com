import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import { SiteNav } from "@/components/nav";
import { SiteFooter } from "@/components/footer";
import { Ground } from "@/components/ground";
import { SpillDriver } from "@/components/spill-driver";
import { ToTop } from "@/components/to-top";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getAllSets } from "@/lib/work";
import { collect } from "@/lib/gallery";
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
    default: "Kestrra — Photo · Film · Development",
    template: "%s — Kestrra",
  },
  description:
    "Photography and film for events, people, the stage and clothing drops; websites, apps and software. Tarik Ramadani, Belgrade, Serbia.",
  alternates: { canonical: "./" },
  openGraph: {
    siteName: "Kestrra",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://kestrra.com/#website",
      name: "Kestrra",
      url: "https://kestrra.com",
    },
    {
      "@type": "Person",
      "@id": "https://kestrra.com/#person",
      name: "Tarik Ramadani",
      jobTitle: "Photographer, filmmaker and software developer",
      url: "https://kestrra.com",
      email: "hello@kestrra.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Belgrade",
        addressCountry: "RS",
      },
      sameAs: ["https://instagram.com/kestrra", "https://github.com/tarikee"],
      worksFor: { "@id": "https://kestrra.com/#organization" },
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://kestrra.com/#organization",
      name: "Kestrra",
      url: "https://kestrra.com",
      email: "hello@kestrra.com",
      areaServed: "Europe",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Belgrade",
        addressCountry: "RS",
      },
    },
  ],
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ground focus:px-4 focus:py-2 type-meta"
          >
            skip to content
          </a>
          {/* order matters: the spill paints first, the ground's silver over
              it, then everything else. Both are z-2, so it is tree order. */}
          <SmoothScroll />
          <SpillDriver />
          <Ground />
          {/* the Photo & film menu's counts, read from the same data as
              /work and /gallery so they never disagree */}
          <SiteNav sets={getAllSets().length} frames={collect().length} />
          <div id="main" className="relative z-10">
            {children}
          </div>
          <ToTop />
          <SiteFooter />
        </body>
      </html>
    </ViewTransitions>
  );
}
