# Architecture

Site web **statique** (GitHub Pages), **100% client-side**. Complète l'`AGENTS.md`
du dépôt (qui fait foi). Volontairement court.

## Stack commune

Vite · React + TypeScript strict · Tailwind CSS (CSS-first, `@theme inline`) ·
Vitest + Testing Library · Playwright · Storybook · ESLint (flat) + Prettier ·
PWA (offline) · CI/CD GitHub Actions (qualité + tests → déploiement Pages).

> Versions exactes : voir `package.json` (ne pas les figer ici pour éviter l'obsolescence).

## Principes transverses

- Dépendances runtime minimales (`react`, `react-dom` + libs domaine justifiées, isolées).
- Thèmes runtime à 2 axes indépendants : identité (`data-theme`) × clair/sombre (`dark`).
- i18n maison FR/EN typée (`src/i18n/`).
- Déploiement : `deploy.yml` à chaque push sur `main` ; `base: '/3DExperiment/'` en prod.

## Ce dépôt : 3DExperiment

Partage de **pièces 3D imprimables** : par pièce, un blueprint coté + un viewer 3D
interactif (react-three-fiber). **Paquet npm unique**, bâti sur le socle NodeTemplate.

```
designs/<piece>/        DONNÉES par pièce : model.scad, design.json, blueprint.mjs (opt), src/
scripts/generator/      génération GÉNÉRIQUE : build.mjs (scad→STL via OpenSCAD-WASM) → écrit public/
src/                    app React (domain / application / infrastructure / components + pages)
public/                 sortie GÉNÉRÉE (designs/, catalog.json) — gitignorée
```

- **Build ordonné** : `npm run build` lance `build:designs` (assets 3D → `public/`)
  **avant** `tsc -b && vite build`. Le générateur n'est pas importé par l'app : celle-ci
  consomme `catalog.json` + STL/SVG par `fetch` au runtime.
- **`designs/`** = données (le quoi, par pièce) ; **`scripts/generator/`** = traitement
  générique (le comment, jamais spécifique à une pièce). Ne pas mélanger les deux.
- **CQRS partiel** (app en lecture seule) : Queries (`application/queries/` + `QueryBus`
  dans `application/cqrs.ts`, résolues par `infrastructure/designRepository.ts`) ;
  Commands du viewer (`application/viewer/viewer.ts`, **reducer** — les composants
  dispatchent, ne mutent jamais l'état directement).

Ajouter une pièce : créer `designs/<piece>/` puis `npm run build:designs` (catalogue MAJ auto).
