# Journal des modifications

Toutes les évolutions notables de ce projet sont consignées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [1.1.1] — 2026-07-01

Version d'outillage et de documentation : hooks Git versionnés, normalisation des
fins de ligne et migration de la documentation agents. Aucun changement fonctionnel.

### Ajouté

- **Hooks Git versionnés** (`.githooks/`, activés automatiquement par le script npm
  `prepare` à chaque `npm install`) : `commit-msg` (sujet conforme Conventional
  Commits), `pre-commit` (`npm run check`) et `pre-push` (`test:e2e` +
  `build-storybook`, parité CI).

### Modifié

- **Fins de ligne normalisées en LF** via `.gitattributes` (`eol=lf`).
- **Documentation agents migrée vers `AGENTS.md`** (ex-`CLAUDE.md`) ; `CLAUDE.md` et
  `.github/copilot-instructions.md` ne sont plus que des renvois vers `AGENTS.md`.
  Ajout de références Claude Code et du garde-fou `--no-verify`.

## [1.1.0] — 2026-06-29

### Modifié

- **Abandon du monorepo npm workspaces au profit d'un paquet unique**, aligné sur la
  structure du socle [NodeTemplate](https://github.com/kevingrillet/NodeTemplate).
  L'app web remonte de `apps/web/` vers la racine (`src/`, `index.html`, `vite.config.ts`,
  `tsconfig*.json`, `.storybook/`…), le générateur passe de `packages/generator/src/`
  à `scripts/generator/`, et les assets générés sont désormais écrits dans `public/`
  (au lieu de `apps/web/public/`).
- **`package.json` unique** : fusion des dépendances, suppression du champ `workspaces`,
  `openscad-wasm` reclassé en `devDependency` (outil de build, jamais embarqué).
- **Nettoyage via `rimraf`** (`clean` / `clean:dist`) à la place du script maison
  `scripts/clean.mjs` (supprimé), pour aligner la sémantique sur les autres projets.
- Mise à jour de `deploy.yml` (artefact `dist`), `dependabot.yml` (une seule entrée npm)
  et de la documentation.

## [1.0.0] — 2026-06-26

Première version : site **statique** de partage de pièces 3D imprimables (blueprint
coté + viewer 3D interactif), généré entièrement à la compilation et hébergé sur
GitHub Pages. Monorepo npm workspaces (designs OpenSCAD + app web React).

### Ajouté

- **Monorepo npm workspaces** : `packages/generator` (outils génériques) et
  `apps/web` (l'application), orchestrés par les scripts de la racine.
- **Pipeline de génération d'assets** (`@3dexperiment/generator`) : compilation
  des modèles **OpenSCAD** en **STL** via `openscad-wasm` (aucune installation
  système requise), génération du **blueprint SVG** coté et du **catalogue**
  (`catalog.json`) consommé par l'app.
- **Une pièce = un dossier** dans `designs/` (`model.scad` source de vérité,
  `design.json` pour les métadonnées, `blueprint.mjs` pour le dessin technique),
  pensé pour accueillir de nouvelles pièces sans toucher au code de l'app.
- **App web React + Vite** : catalogue, page de pièce et page 404
  (`react-router-dom`, `HashRouter` pour GitHub Pages).
- **Viewer 3D interactif** du STL (`react-three-fiber` + `drei` : `OrbitControls`,
  `Bounds`, `Grid`, fil de fer, rotation automatique) avec garde-fou via
  `ErrorBoundary`.
- **Panneau de pièce à onglets** : modèle 3D / blueprint / **code source** / photos
  (`DesignViewer`, `ViewerControls`, `BlueprintViewer`, `SourceViewer`, `PhotoGallery`).
- **Visualiseur de code source OpenSCAD** : onglet « Code source » affichant le
  `.scad` avec **coloration syntaxique maison** (tokeniseur sans dépendance,
  thémable), numéros de ligne et bouton « Copier ». La source `.scad` est aussi
  **téléchargeable** depuis la page de la pièce (en plus du STL).
- **Architecture en couches façon CQRS** : côté lecture via `QueryBus`
  (`ListDesigns`, `GetDesign`) résolu par `infrastructure/designRepository.ts` ;
  côté écriture UI via un reducer de viewer (`application/viewer/viewer.ts`).
- **Internationalisation (fr / en)** maison, sans dépendance externe : contexte
  `t()` + dictionnaires typés (`i18n/messages.ts`), `LanguageSwitcher` à drapeaux
  SVG, langue persistée (localStorage) et détectée depuis le navigateur. Couvre
  aussi le **contenu des pièces** : chaque champ de `design.json` (titre, description,
  tags, cotes, impression, légendes) accepte `{ fr, en }` et est résolu selon la
  langue active côté queries (repli sur le français).
- **Thème clair / sombre** : bascule via la classe `dark` sur `<html>`
  (`ThemeProvider` + `ThemeToggle`), préférence persistée et suivi du système
  (`prefers-color-scheme`), script anti-flash dans `index.html` ; le viewer 3D
  (fond + grille) s'adapte au thème.
- **Style** avec Tailwind CSS et **design tokens** sémantiques (`--color-canvas`,
  `--color-fg`, `--color-ink`…) qui basculent en mode sombre.
- **Documentation des composants** dans Storybook (`DesignCard`, `KeyValueTable`,
  `ViewerControls`).
- **Tests** unitaires / composants (Vitest + Testing Library), **tests e2e**
  (Playwright, sur le build de production servi sous `/3DExperiment/`).
- **Qualité** (ESLint flat config + Prettier) et **CI/CD** (GitHub Actions) :
  contrôle qualité + tests, et déploiement automatique sur GitHub Pages
  (régénération des assets 3D à chaque build).

### Outillage et dépendances

- Stack alignée sur ses dernières versions : **React 19**, **TypeScript 6**,
  **Vite 8** (moteur Rolldown), **Vitest 4**, **ESLint 10**, **Storybook 10**,
  **Tailwind CSS 4**, **react-three-fiber 9** / **drei 10** / **three 0.185**,
  **react-router 7**, ainsi que leurs satellites (`jsdom` 29,
  `eslint-plugin-react-hooks` 7, `globals` 17, `@types/node` 26…).
- **Tailwind v4** : configuration CSS-first via `@theme` dans `src/index.css`
  (plus de `tailwind.config.js`), PostCSS via `@tailwindcss/postcss` (plus
  d'`autoprefixer`).
- **Storybook 10** : addons `essentials` / `interactions` remplacés par
  `@storybook/addon-docs` ; types des stories importés depuis
  `@storybook/react-vite`.
- **Tests e2e** ajoutés (`@playwright/test`, `playwright.config.ts`, dossier
  `tests/`) et **couverture** Vitest (`@vitest/coverage-v8`, script `test:cov`).
- Script **`check`** (format:check + lint + typecheck + test) reproduisant le
  gate de CI en local.
- **Node 24** minimum (`.nvmrc` à 26, champ `engines`) ; CI et déploiement
  alignés sur Node 26.
