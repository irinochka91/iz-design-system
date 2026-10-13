import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'],
  viteFinal: (viteConfig) => {
    // The .d.ts emitter and the library-build settings belong to `vite build` only, not to Storybook.
    viteConfig.plugins = (viteConfig.plugins ?? []).filter(
      (p) => !(p && typeof p === 'object' && 'name' in p && p.name === 'unplugin-dts'),
    );
    delete viteConfig.build?.lib;
    return viteConfig;
  },
};

export default config;
