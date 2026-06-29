# CLAUDE.md — 3DExperiment

Guide pour agents IA. Partage de **pièces 3D imprimables** : pour chaque pièce, un
_blueprint_ coté + un **viewer 3D interactif**. Site **statique** déployé sur GitHub
Pages. **Paquet npm unique** (pas de monorepo) : l'app web vit à la racine, les designs
OpenSCAD dans `designs/`, et les scripts de génération dans `scripts/generator/`.

Bâti sur le socle d'infrastructure
[NodeTemplate](https://github.com/kevingrillet/NodeTemplate) (même outillage **et même
structure** : React 19, Vite, Tailwind v4, Vitest, Playwright, Storybook, thèmes, i18n,
CI/CD Pages).

## Commandes

| Commande                | Effet                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Serveur de dev (HMR).                                               |
| `npm run check`         | **À lancer avant de conclure** : format + lint + typecheck + test.  |
| `npm run build`         | `build:designs` (assets 3D) **puis** `tsc -b && vite build` (site). |
| `npm run build:designs` | Régénère STL + blueprint + `catalog.json` dans `public/`.           |
| `npm run test`          | Vitest (unitaires/composants).                                      |
| `npm run test:e2e`      | Playwright (e2e).                                                   |
| `npm run storybook`     | Storybook (port 6006).                                              |
| `npm run clean`         | `rimraf` build + caches + `node_modules` + assets générés.          |
| `npm run clean:dist`    | Idem **sans** `node_modules`.                                       |

Après une modif : `npm run format` puis `npm run check`. Tout doit être vert.

> ⚠️ Le **build est ordonné** : les assets 3D doivent être régénérés **avant** le build
> Vite (le site consomme `catalog.json` + STL/SVG produits dans `public/`). C'est
> `npm run build` qui enchaîne les deux dans le bon ordre.

## Architecture (paquet unique)

```
3DExperiment/
├─ designs/                  une pièce = un dossier (DONNÉES, par pièce)
│  └─ <piece>/
│     ├─ model.scad          source de vérité (OpenSCAD paramétrique)
│     ├─ design.json         métadonnées (titre, cotes, réglages d'impression…)
│     ├─ blueprint.mjs       dessin technique coté (spécifique) -> SVG (optionnel)
│     └─ src/                plan d'origine + photos
├─ scripts/generator/        génération GÉNÉRIQUE (scad -> STL via WASM, blueprint, catalogue)
│  ├─ build.mjs              orchestrateur : écrit STL/SVG/catalog.json dans public/
│  └─ stl.mjs                compilation OpenSCAD-WASM -> STL
├─ src/                      app React + Vite + Tailwind + react-three-fiber
├─ public/                   sortie GÉNÉRÉE (designs/, catalog.json) — gitignorée
└─ .github/workflows/        CI (qualité) + déploiement Pages
```

`designs/` = **données** (le quoi, par pièce) ; `scripts/generator/` = **traitement
générique** (le comment, jamais spécifique à une pièce). Ne pas mettre de logique propre à
une pièce dans `generator`, ni d'outillage générique dans un `designs/<piece>/`.

Le generator n'est **pas** importé par l'app : c'est un outil de build (Node + OpenSCAD-WASM)
qui écrit des fichiers statiques dans `public/` ; l'app les consomme par `fetch` au runtime
(`catalog.json`). D'où le paquet unique : un seul `package.json`, `openscad-wasm` en
`devDependency`.

## App web — CQRS (partiel, assumé)

App en **lecture seule** (assets statiques) → CQRS **sans write-side serveur** :

- **Queries** (lecture) — `application/queries/` + `QueryBus` (`application/cqrs.ts`) :
  `ListDesigns`, `GetDesign`, résolues par `infrastructure/designRepository.ts`.
- **Commands** (écriture côté UI) — `application/viewer/viewer.ts` : les interactions du
  viewer (changer de vue, rotation auto, fil de fer, reset) sont des _commandes_ traitées
  par un **reducer**. **Les composants ne mutent jamais l'état directement** : ils
  dispatchent des commandes.

Couches : `domain/` (modèle métier) · `application/` (queries/commands/bus) ·
`infrastructure/` (accès données : catalogue, fetch des assets) · `components/` + `pages/`

- `app/` (présentation) · `lib/`, `i18n/`.

## Ajouter une pièce

1. Créer `designs/<ma_piece>/` : `model.scad`, `design.json` (gabarit = pièce existante),
   `blueprint.mjs` _optionnel_ (écrit un SVG vers `process.argv[2]`).
2. `npm run build:designs` régénère tout et **met à jour le catalogue automatiquement** —
   aucun code applicatif à toucher.

## Thèmes, i18n, design system

Hérités du socle : thèmes runtime à deux axes indépendants (identité `data-theme` ×
clair/sombre `dark`), **toujours via les tokens** (`bg-canvas`, `bg-surface`, `text-fg`,
`bg-accent`… — **jamais de couleur Tailwind en dur**) ; i18n maison FR/EN (`Messages`
typée, clé manquante = erreur TS) ; Storybook source de vérité des composants. Voir
`src/index.css` (tokens) et `src/theme.ts`.

## Tests

Unitaires/composants : **Vitest + Testing Library** (`src/`). E2e : **Playwright**
(`tests/`). La CI lance aussi `build` (designs + web) et `build-storybook`.

## Déploiement

Build → artefact **`dist`** → GitHub Pages
(`https://kevingrillet.github.io/3DExperiment/`). Workflow `deploy.yml` à chaque push sur
`main` ; `base: '/3DExperiment/'` en production (sous-chemin Pages), `'/'` en dev.
