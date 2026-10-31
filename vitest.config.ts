import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/**/*.test.{ts,mts,cts,js,mjs,cjs}"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "happy-dom",
          environmentOptions: {
            happyDOM: {
              settings: {
                enableIframePageLoading: true,
                navigation: { disableChildFrameNavigation: true },
              },
            },
          },
          include: ["tests/**/*.test.{tsx,jsx}"],
          setupFiles: ["./tests/setup.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
