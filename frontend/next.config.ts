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
  experimental: {
    // Throttle compilation to prevent OOM errors on Render Free Tier
    workerThreads: false,
    cpus: 1,
    optimizeCss: false,
    gzipSize: false,
    memoryBasedWorkersCount: true,
  },
  webpack: (config) => {
    config.cache = false; // Disable webpack cache to prevent RAM ballooning
    return config;
  },
};

export default nextConfig;
