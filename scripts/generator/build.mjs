#!/usr/bin/env node
// =====================================================================
//  Orchestrateur de build des pièces 3D.
//
//  Pour chaque dossier designs/<id>/ contenant un design.json :
//    1. compile model.scad  -> public/designs/<id>/model.stl
//    2. exécute blueprint.mjs -> public/designs/<id>/blueprint.svg
//    3. copie les photos      -> public/designs/<id>/photos/*
//  Puis écrit le catalogue   -> public/catalog.json
//
//  Les assets de public/designs sont GÉNÉRÉS (gitignorés) :
//  régénérés localement (`npm run build:designs`) et en CI.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scadToStl } from './stl.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// scripts/generator/ -> racine du projet (deux niveaux au-dessus).
const ROOT = path.resolve(__dirname, '../..');
const DESIGNS_DIR = path.join(ROOT, 'designs');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DESIGNS = path.join(PUBLIC_DIR, 'designs');

/** @returns {string[]} ids des designs (dossiers contenant design.json) */
function listDesignIds() {
  if (!fs.existsSync(DESIGNS_DIR)) return [];
  return fs
    .readdirSync(DESIGNS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(DESIGNS_DIR, d.name, 'design.json')))
    .map((d) => d.name);
}

async function buildDesign(id) {
  const dir = path.join(DESIGNS_DIR, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'design.json'), 'utf8'));
  const outDir = path.join(OUT_DESIGNS, id);
  fs.mkdirSync(outDir, { recursive: true });

  // 1. STL
  const scadPath = path.join(dir, meta.model ?? 'model.scad');
  const stlOut = path.join(outDir, 'model.stl');
  console.log(`[${id}] STL  ← ${path.basename(scadPath)}`);
  const size = await scadToStl(scadPath, stlOut);
  console.log(`[${id}] STL  → ${path.relative(ROOT, stlOut)} (${size} o)`);

  // 1b. Source OpenSCAD (téléchargeable : « le code pour refaire la pièce »).
  const scadOut = path.join(outDir, 'model.scad');
  fs.copyFileSync(scadPath, scadOut);
  console.log(`[${id}] SCAD → ${path.relative(ROOT, scadOut)}`);

  // 2. Blueprint (script propre au design, optionnel)
  let blueprintUrl = null;
  if (meta.blueprint) {
    const bpScript = path.join(dir, meta.blueprint);
    const bpOut = path.join(outDir, 'blueprint.svg');
    const r = spawnSync(process.execPath, [bpScript, bpOut], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error(`[${id}] blueprint a échoué (code ${r.status})`);
    blueprintUrl = `designs/${id}/blueprint.svg`;
    console.log(`[${id}] SVG  → ${path.relative(ROOT, bpOut)}`);
  }

  // 3. Photos
  const photos = [];
  for (const p of meta.photos ?? []) {
    const srcPath = path.join(dir, p.file);
    if (!fs.existsSync(srcPath)) continue;
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

async function main() {
  const ids = listDesignIds();
  if (ids.length === 0) {
    console.warn('Aucun design trouvé dans designs/.');
  }
  fs.mkdirSync(OUT_DESIGNS, { recursive: true });

  const designs = [];
  for (const id of ids) {
    designs.push(await buildDesign(id));
  }

  const catalog = { generatedAt: new Date().toISOString(), count: designs.length, designs };
  const catalogPath = path.join(PUBLIC_DIR, 'catalog.json');
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Catalogue → ${path.relative(ROOT, catalogPath)} (${designs.length} pièce(s))`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
