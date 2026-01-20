import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    disableStaticImages: true,
  },
  experimental: {
    disableOptimizedLoading: true,
  },
  
  webpack: (config) => {
    // Désactiver le loader d'image de Next.js
    config.module.rules = config.module.rules.filter(
      (rule: { loader: string | string[] }) =>
        !rule.loader?.includes("next-image-loader")
    );

    // Alias pour faciliter les imports
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./app/components"),
      "@/data": path.resolve(__dirname, "./app/data"),
      "@/i18n": path.resolve(__dirname, "./app/i18n"),
    };

    return config;
  },
};

export default nextConfig;