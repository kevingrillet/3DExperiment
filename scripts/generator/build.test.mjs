// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// OpenSCAD-WASM est lourd (compilation WebAssembly) : on le remplace par un
// double qui renvoie un STL factice non vide. On teste ainsi TOUT le pipeline
// (lecture .scad, écriture du buffer via stl.mjs, blueprint, photos, catalogue)
// sans dépendre du moteur réel.
vi.mock('openscad-wasm', () => ({
  createOpenSCAD: async () => ({
    renderToStl: async () => 'SOLID_FAKE_STL_BINARY_DATA',
  }),
}));

// Importé APRÈS le mock (build.mjs importe stl.mjs qui importe openscad-wasm).
const { build, listDesignIds, resolvePaths } = await import('./build.mjs');

let root;

/** Écrit un fichier en créant les dossiers parents. */
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Crée une pièce de fixture `designs/<id>/` dans la racine temporaire. */
function scaffoldDesign(id, meta, { withPhoto = true } = {}) {
  const dir = path.join(root, 'designs', id);
  write(path.join(dir, 'model.scad'), 'cube([10,10,10]);\n');
  // blueprint.mjs minimal : écrit un SVG vers argv[2] (comme les vrais scripts).
  write(
    path.join(dir, 'blueprint.mjs'),
    [
      "import fs from 'node:fs';",
      "import path from 'node:path';",
      'const out = process.argv[2];',
      'fs.mkdirSync(path.dirname(out), { recursive: true });',
      `fs.writeFileSync(out, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');`,
    ].join('\n'),
  );
  if (withPhoto) write(path.join(dir, 'src', 'photo.jpg'), 'JPEGDATA');
  write(path.join(dir, 'design.json'), JSON.stringify(meta, null, 2));
  return dir;
}

function baseMeta(id) {
  return {
    id,
    title: { fr: 'Titre', en: 'Title' },
    subtitle: { fr: 'Sous', en: 'Sub' },
    description: { fr: 'D', en: 'D' },
    model: 'model.scad',
    blueprint: 'blueprint.mjs',
    tags: ['OpenSCAD'],
    dimensions: [{ label: { fr: 'L', en: 'L' }, value: '10 mm' }],
    printing: [{ label: { fr: 'M', en: 'M' }, value: 'PLA' }],
    photos: [{ file: 'src/photo.jpg', caption: { fr: 'Photo', en: 'Photo' } }],
  };
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), '3dx-build-'));
});
afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('listDesignIds', () => {
  it('ne liste que les dossiers contenant un design.json', () => {
    scaffoldDesign('piece_a', baseMeta('piece_a'));
    fs.mkdirSync(path.join(root, 'designs', 'sans_json'), { recursive: true });
    const ids = listDesignIds(resolvePaths(root).designsDir);
    expect(ids).toEqual(['piece_a']);
  });

  it('renvoie [] si designs/ n’existe pas', () => {
    expect(listDesignIds(path.join(root, 'nope'))).toEqual([]);
  });
});

describe('build (pipeline complet)', () => {
  it('produit un STL non vide, le blueprint, copie les photos et écrit catalog.json', async () => {
    scaffoldDesign('piece_a', baseMeta('piece_a'));
    const catalog = await build(root);
    const { publicDir, outDesigns } = resolvePaths(root);

    // STL produit et NON VIDE.
    const stl = path.join(outDesigns, 'piece_a', 'model.stl');
    expect(fs.existsSync(stl)).toBe(true);
    expect(fs.statSync(stl).size).toBeGreaterThan(0);

    // Source .scad copiée + blueprint SVG généré.
    expect(fs.existsSync(path.join(outDesigns, 'piece_a', 'model.scad'))).toBe(true);
    expect(fs.existsSync(path.join(outDesigns, 'piece_a', 'blueprint.svg'))).toBe(true);

    // Photo copiée.
    expect(fs.existsSync(path.join(outDesigns, 'piece_a', 'photos', 'photo.jpg'))).toBe(true);

    // catalog.json : structure attendue.
    const onDisk = JSON.parse(fs.readFileSync(path.join(publicDir, 'catalog.json'), 'utf8'));
    expect(onDisk).toEqual(catalog);
    expect(onDisk.count).toBe(1);
    expect(typeof onDisk.generatedAt).toBe('string');
    const [d] = onDisk.designs;
    expect(d.id).toBe('piece_a');
    // URLs des assets et des photos correctement construites.
    expect(d.assets).toEqual({
      stl: 'designs/piece_a/model.stl',
      scad: 'designs/piece_a/model.scad',
      blueprint: 'designs/piece_a/blueprint.svg',
    });
    expect(d.photos).toEqual([
      { url: 'designs/piece_a/photos/photo.jpg', caption: { fr: 'Photo', en: 'Photo' } },
    ]);
  });

  it('met blueprint = null quand aucun blueprint n’est déclaré', async () => {
    const meta = baseMeta('piece_b');
    delete meta.blueprint;
    scaffoldDesign('piece_b', meta);
    const catalog = await build(root);
    expect(catalog.designs[0].assets.blueprint).toBeNull();
  });

  it('AVERTIT bruyamment (console.warn) pour une photo déclarée mais absente du disque', async () => {
    const meta = baseMeta('piece_c');
    meta.photos = [{ file: 'src/manquante.jpg', caption: { fr: 'X', en: 'X' } }];
    scaffoldDesign('piece_c', meta, { withPhoto: false });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const catalog = await build(root);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PHOTO INTROUVABLE'));
    // La photo absente n’apparaît pas dans le catalogue (mais n’a pas été un skip silencieux).
    expect(catalog.designs[0].photos).toEqual([]);
  });

  it('ÉCHOUE bruyamment si un design.json est invalide (validation de schéma)', async () => {
    const meta = baseMeta('piece_d');
    delete meta.title; // champ requis manquant
    scaffoldDesign('piece_d', meta);
    await expect(build(root)).rejects.toThrow(/design\.json invalide \[piece_d\]/);
  });
});
