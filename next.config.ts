import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // The asset pipeline owns encoding (ICC carried through, grade untouched).
  // Next's optimizer must never re-encode a frame.
  images: { unoptimized: true },
  experimental: {
    viewTransition: true,
  },
};

// makes the Worker's bindings and vars available to `next dev`, so the inquiry
// action reads the same env locally as it does deployed
initOpenNextCloudflareForDev();

export default nextConfig;
