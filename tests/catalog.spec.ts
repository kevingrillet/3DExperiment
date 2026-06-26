import { test, expect } from '@playwright/test';

/**
 * Smoke test end-to-end : le site se charge et affiche le catalogue.
 * Tourne sur le build de production servi par `vite preview` (voir playwright.config.ts).
 */
test('la page catalogue se charge', async ({ page }) => {
  await page.goto('./');

  // L'en-tête (lien vers l'accueil) est toujours présent, quel que soit l'état du catalogue.
  await expect(page.getByRole('link', { name: /3DExperiment/i })).toBeVisible();

  // Au moins une pièce du catalogue est listée.
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
});
