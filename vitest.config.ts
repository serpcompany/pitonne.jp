import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
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
