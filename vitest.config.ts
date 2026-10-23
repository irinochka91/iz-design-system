import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

// Two projects:
//  - unit: jsdom, Testing Library + axe (vitest-axe) for component tests
//  - storybook: every story runs in real Chromium with axe (addon-a11y, a11y.test = 'error')
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@iz/design-system': fileURLToPath(new URL('./src/index.ts', import.meta.url)) } },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            // Browser choice (see docs/CAPABILITIES.md):
            //  - default: the installed Google Chrome (`channel: 'chrome'`) — Playwright no longer ships Chromium for macOS 12.
            //  - PW_CHROMIUM_PATH=<path>: a specific Chromium binary (used in the cloud workspace).
            provider: playwright({
              launchOptions: process.env.PW_CHROMIUM_PATH
                ? { executablePath: process.env.PW_CHROMIUM_PATH }
                : { channel: 'chrome' },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
