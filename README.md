# 3DExperiment

Partage de **pièces 3D imprimables** : pour chaque pièce, un _blueprint_ coté et un
**modèle 3D interactif** (rotation à la souris). Le site est statique et se déploie sur
GitHub Pages.

> Aujourd'hui une seule pièce (le patin de pied de baby-foot Monneret), mais l'architecture
> est prévue pour en accueillir d'autres : il suffit d'ajouter un dossier dans `designs/`.

## Architecture (paquet npm unique)

```
3DExperiment/
├── designs/                      # une pièce = un dossier
│   └── pied_babyfoot_monneret/
│       ├── model.scad            # source de vérité (OpenSCAD paramétrique)
│       ├── design.json           # métadonnées (titre, cotes, réglages d'impression…)
│       ├── blueprint.mjs          # dessin technique coté (spécifique à la pièce) -> SVG
│       └── src/                  # plan d'origine + photos
├── scripts/generator/            # génération GÉNÉRIQUE (scad -> STL, blueprint, catalogue)
├── src/                          # app React + Vite + Tailwind + react-three-fiber
├── public/                       # sortie générée (designs/, catalog.json) — gitignorée
└── .github/workflows/            # CI (qualité) + déploiement Pages
```

### App web — séparation CQRS (partielle, assumée)

L'app est en lecture seule (assets statiques), donc CQRS **sans write-side serveur** :

- **Queries** (lecture) — `application/queries/` + `QueryBus` (`application/cqrs.ts`).
  `ListDesigns`, `GetDesign` ; résolues par `infrastructure/designRepository.ts`.
- **Commands** (écriture côté UI) — `application/viewer/viewer.ts` : les interactions du
  viewer (changer de vue, rotation auto, fil de fer, reset) sont des _commandes_ traitées
  par un reducer. Les composants ne mutent jamais l'état directement.

## Prérequis

Node ≥ 24 (voir `.nvmrc`). Aucune installation système (OpenSCAD tourne en WebAssembly).

```bash
npm install
```

## Commandes

| Commande                                | Effet                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                           | Serveur de dev Vite (HMR)                                                   |
| `npm run build`                         | Build complet : assets 3D (`build:designs`) **puis** `tsc -b && vite build` |
| `npm run build:designs`                 | Régénère STL + blueprint + `catalog.json` dans `public/`                    |
| `npm run preview`                       | Prévisualise le build de production                                         |
| `npm test` / `npm run test:watch`       | Tests unitaires/composants (Vitest + Testing Library)                       |
| `npm run test:cov`                      | Tests unitaires avec couverture (Vitest + v8)                               |
| `npm run test:e2e` / `test:e2e:ui`      | Tests d'intégration end-to-end (Playwright)                                 |
| `npm run typecheck`                     | Vérification de types (`tsc -b`)                                            |
| `npm run lint` / `lint:fix`             | ESLint                                                                      |
| `npm run format` / `format:check`       | Prettier                                                                    |
| `npm run check`                         | Gate complet : format:check + lint + typecheck + test                       |
| `npm run storybook` / `build-storybook` | Storybook (composants)                                                      |
| `npm run clean`                         | Supprime builds, caches, assets générés **et** `node_modules`               |
| `npm run clean:dist`                    | Idem **sans** `node_modules`                                                |

## Ajouter une nouvelle pièce

1. Créer `designs/<ma_piece>/` avec :
   - `model.scad` — le modèle paramétrique ;
   - `design.json` — métadonnées (voir l'existant comme gabarit) ;
   - `blueprint.mjs` — _optionnel_, dessin coté qui écrit un SVG vers le chemin passé en
     argument (`process.argv[2]`).
2. `npm run build:designs` régénère tout et met à jour le catalogue automatiquement.
3. La pièce apparaît sur la page sommaire, sans toucher au code de l'app.

> **Textes multilingues (fr / en).** Dans `design.json`, tout champ de texte (`title`,
> `subtitle`, `description`, chaque `tag`, les `label`/`value` des cotes et de
> l'impression, les `caption` des photos) accepte soit une chaîne simple (affichée
> telle quelle dans toutes les langues), soit un objet par langue
> `{ "fr": "…", "en": "…" }`. La langue affichée suit le sélecteur de l'interface ;
> à défaut de traduction, on retombe sur le français.

## Déploiement (GitHub Pages)

- Le workflow `.github/workflows/deploy.yml` régénère les assets 3D **en CI** puis publie
  `dist` sur Pages (`base` Vite = `/3DExperiment/`).
- Activer Pages : _Settings → Pages → Source = GitHub Actions_.
- Le nom du dépôt doit être **`3DExperiment`** (sinon ajuster `base` dans
  `vite.config.ts`).

## Détails de la pièce de référence

Voir `designs/pied_babyfoot_monneret/design.json` (cotes, perçage, réglages d'impression).
Le `.scad` reste la source de vérité ; les paramètres du `blueprint.mjs` sont tenus
synchronisés à la main (deux langages distincts).
