import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests d'intégration / end-to-end.
 *
 * Le serveur de prévisualisation est démarré automatiquement (`webServer`) sur le
 * build de PRODUCTION complet (assets 3D + site), ce qui reflète le comportement
 * réel du site déployé sur GitHub Pages. Comme la prod est servie sous le
 * sous-chemin `/3DExperiment/`, c'est ce préfixe qui est utilisé comme `baseURL`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173/3DExperiment/',
    locale: 'fr-FR',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/3DExperiment/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
