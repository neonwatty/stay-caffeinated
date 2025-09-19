/**
 * Bundle analyzer configuration for performance optimization
 * Usage: npm run build:analyze
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.ANALYZE === 'true' && process.env.CI !== 'true',
});

// Bundle analyzer settings for production builds
const analyzerConfig = {
  // Report settings
  reportFilename: '../bundle-analysis.html',
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE || 'both'),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE || 'both'),

  // Size thresholds for warnings (in bytes)
  bundleSizeThreshold: {
    maxAssetSize: 512000, // 500 KB
    maxEntrypointSize: 1024000, // 1 MB
    maxChunkSize: 256000, // 250 KB
  },
};

module.exports = { withBundleAnalyzer, analyzerConfig };