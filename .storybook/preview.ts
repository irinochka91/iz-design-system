import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';
import './storybook.css';

// Theme toolbar: sets data-theme on <html>, exactly as a consuming app would (docs/TOKENS.md).
const THEMES = ['light', 'dark', 'hc-light', 'hc-dark'] as const;

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme (data-theme attribute)',
      toolbar: { title: 'Theme', icon: 'paintbrush', items: [...THEMES], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals }) => {
      const theme = (globals.theme as string) || 'light';
      if (theme === 'light') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', theme);
      return Story();
    },
  ],
  parameters: {
    a11y: {
      // Every story is an accessibility test. 'error' fails the Vitest run and CI (docs/ACCESSIBILITY.md).
      test: 'error',
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } },
    },
    controls: { matchers: { color: /(background|color)$/i } },
    options: {
      storySort: { order: ['Foundations', 'Actions', 'Inputs', 'Display', 'Navigation', 'Overlay', 'Layout', 'Feedback', 'Template'] },
    },
  },
};

export default preview;
