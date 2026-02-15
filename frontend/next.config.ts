import type { NextConfig } from "next";

// Force restart to clear stale generatorV8 cache
const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
