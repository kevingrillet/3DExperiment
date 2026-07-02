// =====================================================================
//  Validation du schéma de design.json (côté generator, build-time).
//
//  Validation MAISON typée légère — pas de dépendance runtime, cohérent avec
//  l'i18n maison et le principe « dépendances runtime minimales » du projet
//  (le generator est un outil de build, jamais embarqué dans l'app).
//
//  En cas de champ manquant / de type invalide, `validateDesign` lève une
//  Error au message clair : le build échoue alors bruyamment (voir build.mjs).
// =====================================================================

/** Erreur de validation d'un design.json (préfixée par l'id de la pièce). */
export class DesignValidationError extends Error {
  /** @param {string} id @param {string} detail */
  constructor(id, detail) {
    super(`design.json invalide [${id}] : ${detail}`);
    this.name = 'DesignValidationError';
  }
}

/** @returns {boolean} true si `v` est un objet simple (ni null, ni tableau). */
function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Vérifie qu'une valeur est un « texte localisé » : soit une chaîne unique,
 * soit un objet `{ fr, en }` avec les DEUX langues renseignées (chaînes non
 * vides). C'est la garantie i18n {fr,en} exigée pour tout texte affiché.
 * @param {unknown} value
 * @param {string} id
 * @param {string} label chemin lisible du champ (ex. `dimensions[0].label`)
 */
export function assertLocalized(value, id, label) {
  if (typeof value === 'string') {
    if (value.trim() === '') throw new DesignValidationError(id, `${label} : chaîne vide`);
    return;
  }
  if (!isPlainObject(value)) {
    throw new DesignValidationError(
      id,
      `${label} : attendu une chaîne ou un objet { fr, en }, reçu ${Array.isArray(value) ? 'tableau' : typeof value}`,
    );
  }
  for (const lang of ['fr', 'en']) {
    if (typeof value[lang] !== 'string' || value[lang].trim() === '') {
      throw new DesignValidationError(id, `${label}.${lang} : traduction manquante ou vide`);
    }
  }
}

/**
 * Valide un objet `design.json` déjà parsé. Lève `DesignValidationError` au
 * premier problème rencontré (message explicite).
 * @param {unknown} meta contenu parsé de design.json
 * @param {string} id id attendu (nom du dossier designs/<id>/)
 * @returns {asserts meta}
 */
export function validateDesign(meta, id) {
  if (!isPlainObject(meta)) {
    throw new DesignValidationError(id, 'racine : objet JSON attendu');
  }

  // id : requis, non vide, cohérent avec le nom du dossier.
  if (typeof meta.id !== 'string' || meta.id.trim() === '') {
    throw new DesignValidationError(id, 'id : chaîne requise');
  }
  if (meta.id !== id) {
    throw new DesignValidationError(id, `id « ${meta.id} » ≠ nom du dossier « ${id} »`);
  }

  // Textes localisés requis.
  assertLocalized(meta.title, id, 'title');
  assertLocalized(meta.subtitle, id, 'subtitle');
  assertLocalized(meta.description, id, 'description');

  // Chemins optionnels (chaînes si présents).
  for (const key of ['model', 'blueprint']) {
    if (meta[key] !== undefined && typeof meta[key] !== 'string') {
      throw new DesignValidationError(id, `${key} : chaîne attendue`);
    }
  }

  // tags : tableau de textes localisés.
  if (!Array.isArray(meta.tags)) throw new DesignValidationError(id, 'tags : tableau attendu');
  meta.tags.forEach((tag, i) => assertLocalized(tag, id, `tags[${i}]`));

  // dimensions / printing : tableaux de { label, value } localisés.
  for (const key of ['dimensions', 'printing']) {
    if (!Array.isArray(meta[key])) throw new DesignValidationError(id, `${key} : tableau attendu`);
    meta[key].forEach((row, i) => {
      if (!isPlainObject(row)) {
        throw new DesignValidationError(id, `${key}[${i}] : objet { label, value } attendu`);
      }
      assertLocalized(row.label, id, `${key}[${i}].label`);
      assertLocalized(row.value, id, `${key}[${i}].value`);
    });
  }

  // photos : tableau de { file, caption } (file = chaîne, caption localisée).
  if (!Array.isArray(meta.photos)) throw new DesignValidationError(id, 'photos : tableau attendu');
  meta.photos.forEach((photo, i) => {
    if (!isPlainObject(photo)) {
      throw new DesignValidationError(id, `photos[${i}] : objet { file, caption } attendu`);
    }
    if (typeof photo.file !== 'string' || photo.file.trim() === '') {
      throw new DesignValidationError(id, `photos[${i}].file : chaîne requise`);
    }
    assertLocalized(photo.caption, id, `photos[${i}].caption`);
  });
}
