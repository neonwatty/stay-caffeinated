import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    // Process isolation settings - use single thread to prevent memory issues
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true,
        memoryLimit: '4GB',
      }
    },
    // Teardown settings
    teardownTimeout: 1000, // Force cleanup after 1 second
    isolate: true, // Ensure tests run in isolation
    // Prevent hanging processes
    testTimeout: 10000, // Increased timeout for slower tests
    hookTimeout: 5000, // Timeout for hooks
    // Force exit after tests complete
    forceRerunTriggers: ['**/vitest-setup.ts'],
    // Better process handling
    onConsoleLog(log) {
      // Filter out noise but keep errors
      if (log.includes('ERROR') || log.includes('Warning')) {
        return false
      }
    },
    // Add max workers limit
    maxWorkers: 1,
    minWorkers: 1,
    coverage: {
      enabled: false,
      reporter: ['text', 'html', 'json-summary', 'json'],
      reportsDirectory: './coverage',
      include: [
        'game/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/types/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})