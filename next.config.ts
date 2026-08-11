import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The asset pipeline owns encoding (ICC carried through, grade untouched).
  // Next's optimizer must never re-encode a frame.
  images: { unoptimized: true },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
