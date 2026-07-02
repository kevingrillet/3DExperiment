// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
//  Garde-fou de synchronisation blueprint.mjs ↔ model.scad.
//
//  RISQUE : les cotes clés de chaque pièce sont dupliquées À LA MAIN entre
//  `model.scad` (source de vérité géométrique) et `blueprint.mjs` (dessin
//  technique). Une modification d'un côté peut dériver de l'autre sans que rien
//  ne le détecte.
//
//  APPROCHE CHOISIE : test de COHÉRENCE DES DIMENSIONS (plutôt qu'un snapshot du
//  SVG). Un snapshot casserait au moindre ajustement de style/mise en page (bruit
//  élevé, faux positifs) ; ce test-ci ne compare QUE les cotes numériques, ce qui
//  cible exactement le risque réel (dérive des dimensions) et reste stable face
//  aux évolutions cosmétiques du blueprint. Il s'applique à toute pièce dont le
//  design.json déclare un `blueprint.mjs`.
// =====================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DESIGNS_DIR = path.join(ROOT, 'designs');

/** Extrait `nom = nombre` d'un source (.scad ou .mjs). Première occurrence. */
function readNumbers(source, names) {
  const out = {};
  for (const name of names) {
    const m = source.match(new RegExp(`\\b${name}\\b\\s*=\\s*(-?[\\d.]+)`));
    out[name] = m ? Number(m[1]) : undefined;
  }
  return out;
}

/**
 * Correspondance des cotes clés : nom côté .scad -> nom côté blueprint.mjs
 * (le blueprint utilise Hthin/Hthick là où le .scad utilise H_thin/H_thick).
 */
const KEY_DIMS = {
  L: 'L',
  W: 'W',
  H_thin: 'Hthin',
  H_thick: 'Hthick',
  hole_d: 'hole_d',
  border: 'border',
  recess_depth: 'recess_depth',
  cb_d: 'cb_d',
  cb_cham: 'cb_cham',
  o5_depth: 'o5_depth',
  cong: 'cong',
  fillet_int: 'fillet_int',
};

/** Pièces disposant d'un blueprint.mjs (donc soumises au garde-fou). */
function designsWithBlueprint() {
  if (!fs.existsSync(DESIGNS_DIR)) return [];
  return fs
    .readdirSync(DESIGNS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((id) => {
      const jsonPath = path.join(DESIGNS_DIR, id, 'design.json');
      if (!fs.existsSync(jsonPath)) return false;
      const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return Boolean(meta.blueprint) && fs.existsSync(path.join(DESIGNS_DIR, id, meta.blueprint));
    });
}

describe('cohérence des cotes blueprint.mjs ↔ model.scad', () => {
  const ids = designsWithBlueprint();

  it('au moins une pièce cotée est présente', () => {
    expect(ids.length).toBeGreaterThan(0);
  });

  it.each(ids)('%s : les cotes clés sont identiques des deux côtés', (id) => {
    const meta = JSON.parse(fs.readFileSync(path.join(DESIGNS_DIR, id, 'design.json'), 'utf8'));
    const scad = fs.readFileSync(path.join(DESIGNS_DIR, id, meta.model ?? 'model.scad'), 'utf8');
    const blueprint = fs.readFileSync(path.join(DESIGNS_DIR, id, meta.blueprint), 'utf8');

    const scadNums = readNumbers(scad, Object.keys(KEY_DIMS));
    const bpNums = readNumbers(blueprint, Object.values(KEY_DIMS));

    for (const [scadName, bpName] of Object.entries(KEY_DIMS)) {
      const scadVal = scadNums[scadName];
      const bpVal = bpNums[bpName];
      // Les deux fichiers DOIVENT déclarer la cote (sinon extraction/renommage cassé).
      expect(scadVal, `${id}: cote ${scadName} absente de model.scad`).not.toBeUndefined();
      expect(bpVal, `${id}: cote ${bpName} absente de blueprint.mjs`).not.toBeUndefined();
      // ... et être égales (détection de dérive).
      expect(bpVal, `${id}: dérive ${scadName}(${scadVal}) ≠ ${bpName}(${bpVal})`).toBe(scadVal);
    }
  });
});
