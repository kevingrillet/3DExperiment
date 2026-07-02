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
    // Tests composants/unitaires (src, jsdom) + tests du generator Node (scripts,
    // fichiers .mjs qui déclarent `// @vitest-environment node` en tête).
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.{test,spec}.mjs'],
    coverage: {
      provider: 'v8',
      // `text` pour la lecture locale, `text-summary` pour le récap, `json-summary`
      // + `lcov` pour la CI (résumé exploitable dans le job / outils externes).
      reporter: ['text', 'text-summary', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
      // Seuils volontairement sous la couverture réelle (marge de sécurité) : ils
      // protègent contre une régression sans casser le vert au moindre ajout.
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
      },
    },
  },
}));
