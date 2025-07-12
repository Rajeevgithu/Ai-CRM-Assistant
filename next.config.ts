import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Vercel to use latest code - deployment fix
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Ensure TypeScript errors are caught
  },
  // Add a comment to force new deployment
  experimental: {
    // This forces Vercel to rebuild
  },
};

export default nextConfig;
