import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 30000,
  expect: { timeout: 10000 },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: /.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:8000',
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      testMatch: /.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:5173',
      },
    },
  ],
  webServer: [
    {
      command: 'cd ../frontend && npm run dev',
      port: 5173,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'node mock/server.js',
      port: 8000,
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});