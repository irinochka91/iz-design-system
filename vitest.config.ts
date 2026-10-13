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
          include: ['src/**/*.test.tsx'],
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
            // PW_CHROMIUM_PATH is only for environments with a preinstalled Chromium; locally run `npx playwright install chromium`.
            provider: playwright(
              process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {},
            ),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
