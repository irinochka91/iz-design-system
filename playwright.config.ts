import { defineConfig, devices } from '@playwright/test';

// Keyboard/e2e tests run against the built Storybook (iframe.html?id=<story-id>).
export default defineConfig({
  testDir: 'src',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:6006', trace: 'retain-on-failure' },
  webServer: { command: 'npm run storybook -- --ci', url: 'http://localhost:6006', reuseExistingServer: true, timeout: 120_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
