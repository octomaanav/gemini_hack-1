import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    extraHTTPHeaders: {
      'x-test-user-email': process.env.E2E_TEST_EMAIL || 'test@example.com',
    },
  },
  retries: process.env.CI ? 1 : 0,
});

