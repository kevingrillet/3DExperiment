// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateDesign, assertLocalized, DesignValidationError } from './validate.mjs';

/** Design minimal valide, réutilisé et muté par cas de test. */
function validMeta() {
  return {
    id: 'piece_test',
    title: { fr: 'Titre', en: 'Title' },
    subtitle: { fr: 'Sous-titre', en: 'Subtitle' },
    description: { fr: 'Desc FR', en: 'Desc EN' },
    model: 'model.scad',
    blueprint: 'blueprint.mjs',
    tags: [{ fr: 'tag', en: 'tag' }, 'OpenSCAD'],
    dimensions: [{ label: { fr: 'Long.', en: 'Length' }, value: '101 mm' }],
    printing: [{ label: { fr: 'Matière', en: 'Material' }, value: { fr: 'PETG', en: 'PETG' } }],
    photos: [{ file: 'src/a.jpg', caption: { fr: 'Photo', en: 'Photo' } }],
  };
}

describe('validateDesign — cas valides', () => {
  it('accepte un design complet et bien formé', () => {
    expect(() => validateDesign(validMeta(), 'piece_test')).not.toThrow();
  });

  it('accepte les champs localisés en chaîne simple (non traduits)', () => {
    const meta = validMeta();
    meta.title = 'Titre unique';
    meta.tags = ['OpenSCAD'];
    expect(() => validateDesign(meta, 'piece_test')).not.toThrow();
  });

  it('accepte des tableaux dimensions/printing/photos vides', () => {
    const meta = validMeta();
    meta.dimensions = [];
    meta.printing = [];
    meta.photos = [];
    expect(() => validateDesign(meta, 'piece_test')).not.toThrow();
  });
});

describe('validateDesign — champs manquants / invalides', () => {
  it('lève si la racine n’est pas un objet', () => {
    expect(() => validateDesign(null, 'x')).toThrow(DesignValidationError);
    expect(() => validateDesign('nope', 'x')).toThrow(/objet JSON attendu/);
  });

  it('lève si id manque', () => {
    const meta = validMeta();
    delete meta.id;
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/id : chaîne requise/);
  });

  it('lève si l’id ne correspond pas au dossier', () => {
    expect(() => validateDesign(validMeta(), 'autre_dossier')).toThrow(/≠ nom du dossier/);
  });

  it('lève si title manque', () => {
    const meta = validMeta();
    delete meta.title;
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/title/);
  });

  it('lève si une traduction (en) manque sur un objet localisé', () => {
    const meta = validMeta();
    meta.description = { fr: 'Desc FR' };
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/description\.en/);
  });

  it('lève si tags n’est pas un tableau', () => {
    const meta = validMeta();
    meta.tags = 'oops';
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/tags : tableau attendu/);
  });

  it('lève si une ligne de dimensions n’a pas de value', () => {
    const meta = validMeta();
    meta.dimensions = [{ label: { fr: 'L', en: 'L' } }];
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/dimensions\[0\]\.value/);
  });

  it('lève si une photo n’a pas de file', () => {
    const meta = validMeta();
    meta.photos = [{ caption: { fr: 'x', en: 'x' } }];
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/photos\[0\]\.file/);
  });

  it('lève si model n’est pas une chaîne', () => {
    const meta = validMeta();
    meta.model = 42;
    expect(() => validateDesign(meta, 'piece_test')).toThrow(/model : chaîne attendue/);
  });
});

describe('assertLocalized', () => {
  it('accepte une chaîne non vide et un objet { fr, en } complet', () => {
    expect(() => assertLocalized('ok', 'id', 'f')).not.toThrow();
    expect(() => assertLocalized({ fr: 'a', en: 'b' }, 'id', 'f')).not.toThrow();
  });

  it('rejette une chaîne vide, un tableau et une traduction vide', () => {
    expect(() => assertLocalized('', 'id', 'f')).toThrow(/chaîne vide/);
    expect(() => assertLocalized([], 'id', 'f')).toThrow(/tableau/);
    expect(() => assertLocalized({ fr: 'a', en: '' }, 'id', 'f')).toThrow(/f\.en/);
  });
});
