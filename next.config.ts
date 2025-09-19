import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProduction ? "/stay-caffeinated" : "",
  images: {
    unoptimized: true,
    // Optimize image formats in production
    formats: ["image/avif", "image/webp"],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    // Remove console logs in production
    removeConsole: isProduction ? {
      exclude: ["error", "warn"],
    } : false,
    // Enable React's runtime automatic JSX transform
    reactRemoveProperties: isProduction ? { properties: ["^data-testid$"] } : false,
  },
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "animejs",
      "@testing-library/react",
      "react",
      "react-dom",
    ],
  },
  // Production build optimizations
  productionBrowserSourceMaps: false,
  // Generate build ID for cache invalidation
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
  // Webpack configuration for production
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      // Minimize bundle size
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        minimize: true,
      };

      // Add bundle analyzer in analyze mode
      if (process.env.ANALYZE === "true") {
        const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: isServer ? "../analyze/server.html" : "./analyze/client.html",
            openAnalyzer: false,
          })
        );
      }
    }
    return config;
  },
  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          }
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          }
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
          }
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
