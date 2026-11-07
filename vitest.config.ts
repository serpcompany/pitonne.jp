import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: [
        'src/**/*.{ts,tsx,mts}',
        'functions/**/*.ts',
        'scripts/**/*.{mjs,ts}',
        'tools/**/*.{ts,mjs}',
        'keystatic.config.ts',
        'next.config.mjs'
      ]
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs', 'tools/**/*.test.ts'],
          exclude: ['**/*.dom.test.tsx', '**/node_modules/**']
        }
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          environmentOptions: {
            happyDOM: {
              settings: {
                enableIframePageLoading: true,
                handleDisabledFileLoadingAsSuccess: true,
                navigation: { disableChildFrameNavigation: true }
              }
            }
          },
          include: ['src/**/*.dom.test.tsx'],
          setupFiles: ['./src/test/setup.ts']
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
