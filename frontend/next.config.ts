import type { NextConfig } from "next";

// Force restart to clear stale generatorV8 cache
// @ts-ignore
const nextConfig: NextConfig = {
  // output: 'standalone', // Disabled for Netlify compatibility
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
