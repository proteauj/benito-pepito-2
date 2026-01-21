import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    disableStaticImages: true,
  },
  experimental: {
    disableOptimizedLoading: true,
  },
  // Ajouté pour forcer Next.js à prendre le bon root et éviter l'erreur Prisma
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;

export default nextConfig;