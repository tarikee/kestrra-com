import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// pages come from the Worker, so they get these here; public files get the
// same set from public/_headers
const SECURITY = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // The asset pipeline owns encoding (ICC carried through, grade untouched).
  // Next's optimizer must never re-encode a frame.
  images: { unoptimized: true },
  experimental: {
    viewTransition: true,
  },
  // one address: www goes to the bare domain
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.kestrra.com" }],
        destination: "https://kestrra.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY }];
  },
};

// makes the Worker's bindings and vars available to `next dev`, so the inquiry
// action reads the same env locally as it does deployed
initOpenNextCloudflareForDev();

export default nextConfig;
