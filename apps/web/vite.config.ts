/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages sert le site sous /<repo>/. En dev on reste à la racine.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/3DExperiment/' : '/',
  plugins: [react()],
  server: {
    // On ne surveille pas les sorties de build : sinon un `build-storybook`
    // concurrent verrouille des fichiers et fait planter le watcher (EBUSY).
    watch: { ignored: ['**/dist/**', '**/storybook-static/**', '**/coverage/**'] },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
}));
