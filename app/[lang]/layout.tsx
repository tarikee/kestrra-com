import { og } from "@/lib/og";
import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { SiteNav } from "@/components/nav";
import { PathTrail } from "@/components/back-link";
import { ScrollMemory } from "@/components/scroll-memory";
import { SiteFooter } from "@/components/footer";
import { Ground } from "@/components/ground";
import { SpillDriver } from "@/components/spill-driver";
import { LangHint } from "@/components/lang-hint";
import { ToTop } from "@/components/to-top";
import { SmoothScroll } from "@/components/smooth-scroll";
import { dict } from "@/dictionaries";
import { alternates, isLang, LANGS } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { grotesk, fragment } from "@/lib/fonts";
import "../globals.css";
import { PRESS } from "@/content/press";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const m = dict(lang).meta.home;
  return {
    metadataBase: new URL("https://kestrra.com"),
    title: { default: m.title, template: "%s · Kestrra" },
    description: m.description,
    alternates: alternates("/", lang),
    openGraph: og(lang),
  };
}

const jsonLd = (lang: "en" | "sr") => ({
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
      jobTitle: lang === "sr" ? "Fotograf, snimatelj i programer" : "Photographer, filmmaker and software developer",
      url: "https://kestrra.com",
      email: "hello@kestrra.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Belgrade",
        addressCountry: "RS",
      },
      sameAs: ["https://www.instagram.com/kestrra", "https://github.com/tarikee"],
      subjectOf: PRESS.map((p) => ({
        "@type": "Article",
        headline: p.title,
        url: p.href,
        publisher: { "@type": "Organization", name: p.outlet },
      })),
      knowsLanguage: ["en", "sr"],
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: lang === "sr" ? "Univerzitet u Beogradu, Matematički fakultet" : "University of Belgrade, Faculty of Mathematics",
        url: "https://www.matf.bg.ac.rs",
      },
      knowsAbout: ["Photography", "Filmmaking", "Color grading", "Web development", "Software development"],
      worksFor: { "@id": "https://kestrra.com/#organization" },
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://kestrra.com/#organization",
      name: "Kestrra",
      url: "https://kestrra.com",
      email: "hello@kestrra.com",
      logo: "https://kestrra.com/apple-icon.png",
      description:
        lang === "sr"
          ? "Fotografija, video, color grading, kao i sajtovi, aplikacije i softver, Tarik Ramadani iz Beograda, Srbija."
          : "Photography, video, color grading, and websites, apps and software by Tarik Ramadani, based in Belgrade, Serbia.",
      founder: { "@id": "https://kestrra.com/#person" },
      sameAs: ["https://www.instagram.com/kestrra"],
      knowsLanguage: ["en", "sr"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "inquiries",
        email: "hello@kestrra.com",
        url: lang === "sr" ? "https://kestrra.com/sr/upit" : "https://kestrra.com/inquiry",
        availableLanguage: ["English", "Serbian"],
      },
      knowsAbout: ["Photography", "Event photography", "Filmmaking", "Color grading", "Web development", "Software development"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: lang === "sr" ? "Usluge" : "Services",
        itemListElement: (lang === "sr"
          ? [
              "Fotografisanje događaja",
              "Fotografisanje brendova i kampanja",
              "Fotografisanje koncerata i scene",
              "Snimanje spotova i promo videa",
              "Color grading",
              "Izrada sajtova i aplikacija",
            ]
          : [
              "Event photography",
              "Brand and campaign photography",
              "Concert and stage photography",
              "Music video and promo filming",
              "Color grading",
              "Website and app development",
            ]
        ).map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
      },
      areaServed: [
        { "@type": "City", name: lang === "sr" ? "Beograd" : "Belgrade" },
        { "@type": "Country", name: lang === "sr" ? "Srbija" : "Serbia" },
        { "@type": "Place", name: lang === "sr" ? "Evropa" : "Europe" },
      ],
      geo: { "@type": "GeoCoordinates", latitude: 44.8176, longitude: 20.4569 },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Belgrade",
        addressCountry: "RS",
      },
    },
  ],
});

export const viewport: Viewport = {
  themeColor: "#08090A",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang).common;
  return (
    <ViewTransitions>
      <html lang={lang === "sr" ? "sr-Latn" : "en"} className={`${grotesk.variable} ${fragment.variable}`}>
        <body className="bg-ground text-hi antialiased">
          <PathTrail />
          <ScrollMemory />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)).replace(/</g, "\\u003c") }}
          />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ground focus:px-4 focus:py-2 type-meta"
          >
            {t.skip}
          </a>
          {/* order matters: the spill paints first, the ground's silver over
              it, then everything else. Both are z-2, so it is tree order. */}
          <SmoothScroll />
          <SpillDriver />
          <Ground />
          {/* the Photo & film menu's counts, read from the same data as
              /sets and /gallery so they never disagree */}
          <SiteNav />
          <div id="main" className="relative z-10">
            {children}
          </div>
          <ToTop />
          {lang === "en" && <LangHint />}
          <SiteFooter lang={lang} />
        </body>
      </html>
    </ViewTransitions>
  );
}
