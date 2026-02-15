import type { NextConfig } from "next";

// Force restart to clear stale generatorV8 cache
// @ts-ignore
const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
