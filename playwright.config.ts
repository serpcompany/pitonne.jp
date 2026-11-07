import { defineConfig, devices } from 'playwright/test'

const port = Number(process.env.E2E_PORT ?? 8791)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'tmp/e2e/results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { outputFolder: 'tmp/e2e/report', open: 'never' }]
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: `pnpm preview --ip 127.0.0.1 --port ${port}`,
    url: `${baseURL}/robots.txt`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { WRANGLER_SEND_METRICS: 'false' }
  }
})
