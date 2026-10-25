import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import iz from './tools/eslint-plugin-iz/index.js';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'node_modules', 'playwright-report', 'test-results', 'coverage', 'tools/figma-plugin/code.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.strict,
  reactHooks.configs.flat.recommended,
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { iz },
    rules: {
      // Tokens, never raw values (specs/HANDOFF.md rule 4). CSS is covered by stylelint.
      'iz/no-raw-colors': 'error',
      'iz/no-raw-spacing': 'error',
      // Design-system rules (see docs/CONTRIBUTING.md)
      'no-restricted-syntax': [
        'error',
        { selector: "JSXAttribute[name.name='style']", message: 'No inline styles in components — use CSS Modules with --iz-* tokens.' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Figma plugin sandbox: `figma` and `__html__` are injected globals, and the UI half runs in an
    // iframe. Not part of the library build — see tools/figma-plugin/README.md.
    files: ['tools/figma-plugin/**/*.js'],
    languageOptions: { globals: { figma: 'readonly', __html__: 'readonly', IZ_TOKENS: 'readonly', IZ_TOKENS_BUILT_AT: 'readonly' } },
  },
);
