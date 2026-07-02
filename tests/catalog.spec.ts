import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

/**
 * Accessibilité automatisée (axe-core) — PATTERN RÉUTILISABLE (aligné NodeTemplate).
 *
 * On scanne la page avec les jeux de règles WCAG 2.x A + AA et on n'échoue que sur
 * les violations `serious` / `critical` : ce seuil attrape les vrais blocages
 * (contraste, nom accessible, ARIA cassé) sans transformer chaque avertissement
 * mineur en test rouge. Pour une nouvelle page : dupliquer ce test, adapter le `goto`.
 */
async function scanSeriousA11yViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

test("le catalogue n'a pas de violation a11y sérieuse/critique", async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('link', { name: /3DExperiment/i })).toBeVisible();
  expect(await scanSeriousA11yViolations(page)).toEqual([]);
});
