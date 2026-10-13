import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';

// Library build. Consumers import from '@iz/design-system' and '@iz/design-system/styles.css'.
export default defineConfig({
  plugins: [react(), dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.tsx', 'src/test'] })],
  publicDir: false, // public/ is Storybook's staticDir, not part of the library tarball
  css: { modules: { localsConvention: 'camelCaseOnly', generateScopedName: 'iz-[name]-[local]-[hash:base64:5]' } },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'styles',
    },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
    sourcemap: true,
    target: 'es2022',
  },
});
