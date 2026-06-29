// Modèle de domaine — une « pièce 3D » et son catalogue.
// Le catalog.json produit par @3dexperiment/generator stocke des valeurs
// LOCALISÉES (texte par langue) ; les types « résolus » ci-dessous (Design,
// DesignSummary, KeyValue, Photo) portent des chaînes déjà traduites dans une
// langue donnée — ce que consomment les composants.
import type { Lang } from '../i18n/messages';

/** Un texte traduisible : soit une chaîne unique, soit un objet par langue. */
export type LocalizedString = string | Partial<Record<Lang, string>>;

export interface KeyValue {
  label: string;
  value: string;
}

export interface Photo {
  url: string;
  caption: string;
}

export interface DesignAssets {
  /** URL (relative à BASE_URL) du fichier STL. */
  stl: string;
  /** URL de la source OpenSCAD (`.scad`) — le code pour refaire la pièce. */
  scad: string;
  /** URL du blueprint SVG, ou null si la pièce n'en a pas. */
  blueprint: string | null;
}

/** Vue « résumé » d'une pièce (résolue), suffisante pour la page sommaire. */
export interface DesignSummary {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
}

/** Pièce complète (résolue), telle qu'affichée sur la page de détail. */
export interface Design extends DesignSummary {
  dimensions: KeyValue[];
  printing: KeyValue[];
  assets: DesignAssets;
  photos: Photo[];
}

export interface Catalog {
  generatedAt: string;
  count: number;
  designs: Design[];
}

// --- Formes BRUTES (telles que stockées dans catalog.json, textes localisés) ---

export interface RawKeyValue {
  label: LocalizedString;
  value: LocalizedString;
}

export interface RawPhoto {
  url: string;
  caption: LocalizedString;
}

export interface RawDesign {
  id: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  tags: LocalizedString[];
  dimensions: RawKeyValue[];
  printing: RawKeyValue[];
  assets: DesignAssets;
  photos: RawPhoto[];
}

export interface RawCatalog {
  generatedAt: string;
  count: number;
  designs: RawDesign[];
}

/**
 * Résout un texte localisé vers une langue : valeur de la langue demandée, sinon
 * repli sur le français, sinon la première traduction disponible.
 */
export function localize(value: LocalizedString, lang: Lang): string {
  if (typeof value === 'string') return value;
  return value[lang] ?? value.fr ?? Object.values(value)[0] ?? '';
}

function localizeRows(rows: RawKeyValue[], lang: Lang): KeyValue[] {
  return rows.map((r) => ({ label: localize(r.label, lang), value: localize(r.value, lang) }));
}

/** Résout une pièce brute en résumé traduit. */
export function resolveDesignSummary(raw: RawDesign, lang: Lang): DesignSummary {
  return {
    id: raw.id,
    title: localize(raw.title, lang),
    subtitle: localize(raw.subtitle, lang),
    description: localize(raw.description, lang),
    tags: raw.tags.map((t) => localize(t, lang)),
  };
}

/** Résout une pièce brute complète en pièce traduite. */
export function resolveDesign(raw: RawDesign, lang: Lang): Design {
  return {
    ...resolveDesignSummary(raw, lang),
    dimensions: localizeRows(raw.dimensions, lang),
    printing: localizeRows(raw.printing, lang),
    assets: raw.assets,
    photos: raw.photos.map((p) => ({ url: p.url, caption: localize(p.caption, lang) })),
  };
}
