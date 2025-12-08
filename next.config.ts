import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules/, message: /Failed to parse source map/ },
    ];
    return config;
  },
};

export default nextConfig;
