#!/usr/bin/env node
// =====================================================================
//  Orchestrateur de build des pièces 3D.
//
//  Pour chaque dossier designs/<id>/ contenant un design.json :
//    0. VALIDE design.json (schéma maison) — échec bruyant si invalide
//    1. compile model.scad  -> public/designs/<id>/model.stl
//    2. exécute blueprint.mjs -> public/designs/<id>/blueprint.svg
//    3. copie les photos      -> public/designs/<id>/photos/*
//  Puis écrit le catalogue   -> public/catalog.json
//
//  Les assets de public/designs sont GÉNÉRÉS (gitignorés) :
//  régénérés localement (`npm run build:designs`) et en CI.
//
//  Ce module est aussi IMPORTABLE (fonctions exportées) : `main()` n'est lancé
//  automatiquement que lorsque le fichier est exécuté en CLI (garde `isMain`),
//  ce qui rend le générateur testable (voir build.test.mjs).
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scadToStl } from './stl.mjs';
import { validateDesign } from './validate.mjs';

// scripts/generator/build.mjs -> racine du projet (deux niveaux au-dessus).
const DEFAULT_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');

/**
 * Calcule les chemins de travail à partir d'une racine (injectable pour les tests).
 * @param {string} root racine du projet
 */
export function resolvePaths(root) {
  const publicDir = path.join(root, 'public');
  return {
    root,
    designsDir: path.join(root, 'designs'),
    publicDir,
    outDesigns: path.join(publicDir, 'designs'),
  };
}

/**
 * @param {string} designsDir
 * @returns {string[]} ids des designs (dossiers contenant design.json)
 */
export function listDesignIds(designsDir) {
  if (!fs.existsSync(designsDir)) return [];
  return fs
    .readdirSync(designsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(designsDir, d.name, 'design.json')))
    .map((d) => d.name);
}

/**
 * Construit une pièce : validation, STL, source, blueprint, photos.
 * @param {string} id
 * @param {ReturnType<typeof resolvePaths>} paths
 */
export async function buildDesign(id, paths) {
  const { root, designsDir, outDesigns } = paths;
  const dir = path.join(designsDir, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'design.json'), 'utf8'));

  // 0. Validation du schéma — échec bruyant (throw) si invalide.
  validateDesign(meta, id);

  const outDir = path.join(outDesigns, id);
  fs.mkdirSync(outDir, { recursive: true });

  // 1. STL
  const scadPath = path.join(dir, meta.model ?? 'model.scad');
  const stlOut = path.join(outDir, 'model.stl');
  console.log(`[${id}] STL  ← ${path.basename(scadPath)}`);
  const size = await scadToStl(scadPath, stlOut);
  console.log(`[${id}] STL  → ${path.relative(root, stlOut)} (${size} o)`);

  // 1b. Source OpenSCAD (téléchargeable : « le code pour refaire la pièce »).
  const scadOut = path.join(outDir, 'model.scad');
  fs.copyFileSync(scadPath, scadOut);
  console.log(`[${id}] SCAD → ${path.relative(root, scadOut)}`);

  // 2. Blueprint (script propre au design, optionnel)
  let blueprintUrl = null;
  if (meta.blueprint) {
    const bpScript = path.join(dir, meta.blueprint);
    const bpOut = path.join(outDir, 'blueprint.svg');
    const r = spawnSync(process.execPath, [bpScript, bpOut], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error(`[${id}] blueprint a échoué (code ${r.status})`);
    blueprintUrl = `designs/${id}/blueprint.svg`;
    console.log(`[${id}] SVG  → ${path.relative(root, bpOut)}`);
  }

  // 3. Photos — une photo déclarée mais absente du disque est une ANOMALIE :
  //    on la signale bruyamment (WARNING visible) au lieu d'un skip silencieux.
  const photos = [];
  for (const p of meta.photos ?? []) {
    const srcPath = path.join(dir, p.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(
        `[${id}] ⚠  PHOTO INTROUVABLE, ignorée : ${p.file} ` +
          `(déclarée dans design.json mais absente de ${path.relative(root, dir)})`,
      );
      continue;
    }
    const base = path.basename(p.file);
    const dest = path.join(outDir, 'photos', base);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcPath, dest);
    photos.push({ url: `designs/${id}/photos/${base}`, caption: p.caption ?? '' });
  }

  return {
    id,
    title: meta.title ?? id,
    subtitle: meta.subtitle ?? '',
    description: meta.description ?? '',
    tags: meta.tags ?? [],
    dimensions: meta.dimensions ?? [],
    printing: meta.printing ?? [],
    assets: {
      stl: `designs/${id}/model.stl`,
      scad: `designs/${id}/model.scad`,
      blueprint: blueprintUrl,
    },
    photos,
  };
}

/**
 * Build complet : toutes les pièces + écriture de catalog.json.
 * @param {string} [root] racine du projet (injectable en test)
 * @returns {Promise<object>} le catalogue écrit
 */
export async function build(root = DEFAULT_ROOT) {
  const paths = resolvePaths(root);
  const ids = listDesignIds(paths.designsDir);
  if (ids.length === 0) {
    console.warn('Aucun design trouvé dans designs/.');
  }
  fs.mkdirSync(paths.outDesigns, { recursive: true });

  const designs = [];
  for (const id of ids) {
    designs.push(await buildDesign(id, paths));
  }

  const catalog = { generatedAt: new Date().toISOString(), count: designs.length, designs };
  const catalogPath = path.join(paths.publicDir, 'catalog.json');
  fs.mkdirSync(paths.publicDir, { recursive: true });
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Catalogue → ${path.relative(paths.root, catalogPath)} (${designs.length} pièce(s))`);
  return catalog;
}

// --- CLI : ne s'exécute que lancé directement (pas à l'import, pour les tests). ---
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  build().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
