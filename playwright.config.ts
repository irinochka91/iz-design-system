import { defineConfig, devices } from '@playwright/test';

// Keyboard/e2e tests run against the built Storybook (iframe.html?id=<story-id>).
export default defineConfig({
  testDir: 'src',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  // The first story each worker opens waits for Vite's cold compile; on macOS 12 + Chrome that is
  // routinely over Playwright's default 5 s. 15 s keeps a genuine hang visible while removing the
  // "element(s) not found" flake that hit whichever test navigated first (seen 2026-10-25).
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:6006', trace: 'retain-on-failure' },
  webServer: { command: 'npm run storybook -- --ci', url: 'http://localhost:6006', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    {
      name: 'chromium',
      // Installed Google Chrome by default (Playwright ships no Chromium for macOS 12); PW_CHROMIUM_PATH overrides.
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : { channel: 'chrome' }),
      },
    },
  ],
});
