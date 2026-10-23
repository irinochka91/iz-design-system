import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';
import './storybook.css';
import { themes as THEME_DEFS } from '../tokens/themes.config.ts';

// Theme toolbar: driven by tokens/themes.config.ts, so a theme added there shows up here with no
// edit. Sets data-theme AND data-iz-theme on <html>, exactly as a consuming app would (ADR-011).
const THEME_IDS = THEME_DEFS.map((t) => t.id);
const ATTRIBUTES = ['data-theme', 'data-iz-theme'] as const;

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme (data-theme / data-iz-theme attribute)',
      toolbar: { title: 'Theme', icon: 'paintbrush', items: THEME_IDS, dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals }) => {
      const id = (globals.theme as string) || 'light';
      const attribute = THEME_DEFS.find((t) => t.id === id)?.attribute ?? null;
      for (const name of ATTRIBUTES) {
        if (attribute === null) document.documentElement.removeAttribute(name);
        else document.documentElement.setAttribute(name, attribute);
      }
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
