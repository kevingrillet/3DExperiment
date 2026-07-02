# Architecture

Site web **statique** (GitHub Pages), **100% client-side**. Complète l'`AGENTS.md`
du dépôt (qui fait foi). Volontairement court.

Stack, thèmes, i18n, dépendances minimales et déploiement : voir `AGENTS.md` (détail) et
`coding-standards.md` (règles transverses). Versions exactes : `package.json`.

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
