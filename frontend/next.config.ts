import type { NextConfig } from "next";

// Force restart to clear stale generatorV8 cache
// @ts-ignore
const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
