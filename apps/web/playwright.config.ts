import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter @isometrica/web dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: true,
    cwd: process.cwd(),
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api',
      API_BACKEND_URL: 'http://localhost:3001',
    },
  },
})
