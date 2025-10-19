import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
  },
  
  // Enable experimental features for better performance
  //experimental: {
  //  optimizeCss: true,
  //  optimizePackageImports: ['@clerk/nextjs'],
  //},
  
  // Bundle analyzer (for development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      if (typeof require !== 'undefined') {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),
};

export default nextConfig;
