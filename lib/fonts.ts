import localFont from "next/font/local";

// Both faces are subset to what the site sets: Latin with Latin Extended-A
// (č ć đ š ž), Serbian Cyrillic, punctuation, arrows and €. The grotesk keeps
// its weight axis and is pinned upright (the site sets no italics).
export const grotesk = localFont({
  src: "../public/fonts/OverusedGrotesk-VF-subset.woff2",
  variable: "--font-grotesk",
  weight: "300 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const fragment = localFont({
  src: "../public/fonts/FragmentMono-Regular-subset.woff2",
  variable: "--font-fragment",
  weight: "400",
  display: "swap",
  fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
  adjustFontFallback: false,
});
