# AGENTS.md — 3DExperiment

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
| `npm run test`          | Vitest (unitaires/composants + generator).                          |
| `npm run test:cov`      | Vitest avec couverture (seuils dans `vite.config.ts`).              |
| `npm run test:e2e`      | Playwright (e2e + scan a11y axe-core).                              |
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

Guide pas-à-pas. **Aucun code applicatif à toucher** : le generator découvre les pièces
et met à jour le catalogue automatiquement.

1. **Créer le dossier** `designs/<id>/` — `<id>` est l'identifiant (nom de dossier),
   `snake_case`, et **doit être égal au champ `id` du `design.json`** (vérifié par la
   validation, voir plus bas).

2. **`model.scad`** — la **source de vérité** géométrique (OpenSCAD paramétrique). Les
   cotes principales sont des variables en tête de fichier (`L`, `W`, `H_thick`…).

3. **`design.json`** — métadonnées de la pièce. Gabarit = une pièce existante
   (`pied_babyfoot_monneret`). Schéma (validé au build, voir § Validation) :

   | Champ                                | Type                                            | Requis |
   | ------------------------------------ | ----------------------------------------------- | ------ |
   | `id`                                 | chaîne (= nom du dossier)                       | oui    |
   | `title` / `subtitle` / `description` | texte localisé (`"x"` ou `{ fr, en }`)          | oui    |
   | `tags`                               | tableau de textes localisés                     | oui    |
   | `dimensions` / `printing`            | tableau de `{ label, value }` (localisés)       | oui    |
   | `photos`                             | tableau de `{ file, caption }`                  | oui    |
   | `model`                              | chaîne (défaut `model.scad`)                    | non    |
   | `blueprint`                          | chaîne (script à exécuter, ex. `blueprint.mjs`) | non    |

   Un **texte localisé** est soit une chaîne unique, soit un objet `{ fr, en }` dont les
   **deux** langues sont renseignées (l'app résout selon la langue active, repli sur `fr`).

4. **`blueprint.mjs`** _(optionnel)_ — dessin technique coté. Script Node qui **écrit un
   SVG vers `process.argv[2]`** (chemin de sortie passé par le generator). ⚠️ Voir la
   contrainte de synchronisation ci-dessous.

5. **Photos** — placer les fichiers sous `designs/<id>/src/` (ou tout chemin relatif au
   dossier de la pièce) et les déclarer dans `photos[].file`. Une photo **déclarée mais
   absente du disque** provoque un **WARNING bruyant** au build (plus de skip silencieux).

6. **`npm run build:designs`** — pour chaque pièce, `scripts/generator/build.mjs` :
   valide `design.json`, compile `model.scad` → `public/designs/<id>/model.stl`, copie la
   source `.scad`, exécute `blueprint.mjs` → `blueprint.svg`, copie les photos, puis écrit
   `public/catalog.json` (consommé par l'app au runtime via `fetch`).

### ⚠️ Contrainte : synchronisation `blueprint.mjs` ↔ `model.scad`

Les cotes clés d'une pièce sont **dupliquées à la main** entre `model.scad` (source de
vérité) et `blueprint.mjs` (constantes en tête, ex. `L`, `W`, `Hthin`/`Hthick`…). Modifier
une cote d'un seul côté crée une **dérive silencieuse** entre le modèle 3D et le dessin coté.

Garde-fou : `scripts/generator/blueprint-sync.test.mjs` extrait les cotes numériques des
deux fichiers et **échoue si elles divergent**. On a préféré ce test de cohérence à un
snapshot du SVG : le snapshot casserait au moindre ajustement cosmétique (bruit), alors que
ce test ne compare que les nombres — il cible exactement le risque. **Toute nouvelle pièce
cotée doit garder ces constantes alignées** ; ajouter la correspondance de noms dans
`KEY_DIMS` si le blueprint renomme des variables.

### Validation de `design.json`

`scripts/generator/validate.mjs` (validation **maison typée**, zéro dépendance runtime)
vérifie au build les champs requis, leurs types et la présence des deux langues sur les
textes localisés en objet. Un `design.json` invalide fait **échouer bruyamment le build**
avec un message clair (`design.json invalide [<id>] : …`). Tests : `validate.test.mjs`.

## Thèmes, i18n, design system

Hérités du socle : thèmes runtime à deux axes indépendants (identité `data-theme` ×
clair/sombre `dark`), **toujours via les tokens** (`bg-canvas`, `bg-surface`, `text-fg`,
`bg-accent`… — **jamais de couleur Tailwind en dur**) ; i18n maison FR/EN (`Messages`
typée, clé manquante = erreur TS) ; Storybook source de vérité des composants. Voir
`src/index.css` (tokens) et `src/theme.ts`.

## Tests

Unitaires/composants : **Vitest + Testing Library** (`src/`). E2e : **Playwright**
(`tests/`). La CI lance aussi `build` (designs + web) et `build-storybook`.

- **Couverture** : `npm run test:cov` (reporters `text`/`json-summary`/`lcov`), seuils dans
  `vite.config.ts` (`thresholds` : ~lines/functions/statements 80 %, branches 75 %) ; la CI
  publie un résumé + un artefact `coverage/`.
- **Tests du generator** : les scripts Node de `scripts/generator/` sont testés par des
  fichiers `*.test.mjs` (env `node`), inclus dans le run Vitest (voir `vite.config.ts`
  `include`) — ils mockent `openscad-wasm` et travaillent sur un dossier temporaire.
- **a11y unitaire** : convention `*.a11y.test.tsx` + helper `src/test/a11y.tsx` (`renderA11y`
  rend sous les contextes i18n + thème) — teste rôles/noms accessibles, ARIA et clavier.
- **a11y e2e** : `@axe-core/playwright` dans `tests/catalog.spec.ts` (échec uniquement sur
  les violations `serious`/`critical`).
- **Lighthouse CI** : `@lhci/cli` + `lighthouserc.json` (accessibilité bloquante ≥ 0,9, le
  reste en `warn`), workflow `.github/workflows/lighthouse.yml`. Le site étant servi sous
  `/3DExperiment/`, lhci démarre `vite preview` (`startServerCommand`) plutôt que
  `staticDistDir` (qui servirait à la racine et casserait les chemins d'assets).

## Déploiement

Build → artefact **`dist`** → GitHub Pages
(`https://kevingrillet.github.io/3DExperiment/`). Workflow `deploy.yml` à chaque push sur
`main` ; `base: '/3DExperiment/'` en production (sous-chemin Pages), `'/'` en dev.
