import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The workspace starts at the overview. Redirecting here rather than from a
  // page component keeps it a plain server redirect, with no component render
  // and no prerender warning.
  async redirects() {
    return [{ source: "/", destination: "/overview", permanent: false }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
