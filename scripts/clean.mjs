#!/usr/bin/env node
// Nettoyage multiplateforme des artefacts générés.
//   node scripts/clean.mjs        -> supprime build/cache/assets générés
//   node scripts/clean.mjs --all  -> + node_modules (tous les workspaces)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const all = process.argv.includes('--all');

const targets = [
  'apps/web/dist',
  'apps/web/storybook-static',
  'apps/web/coverage',
  'apps/web/public/designs',
  'apps/web/public/catalog.json',
  'apps/web/node_modules/.vite',
  'playwright-report',
  'test-results',
];

if (all) {
  targets.push('node_modules', 'apps/web/node_modules', 'packages/generator/node_modules');
}

let removed = 0;
for (const t of targets) {
  const p = path.join(ROOT, t);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`supprimé : ${t}`);
    removed++;
  }
}
console.log(removed ? `\n${removed} cible(s) nettoyée(s).` : 'Rien à nettoyer.');
