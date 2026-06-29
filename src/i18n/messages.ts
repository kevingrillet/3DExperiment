/**
 * Dictionnaires de traduction (français / anglais).
 *
 * Le français est la langue de référence. L'interface `Messages` garantit que les
 * deux dictionnaires ont la même structure : impossible d'oublier une clé. Seul le
 * « chrome » de l'interface est traduit ; les données des pièces (titres, tags,
 * cotes…) proviennent des `design.json` et restent telles quelles.
 */
export type Lang = 'fr' | 'en';

export const LANGS: Lang[] = ['fr', 'en'];

export interface Messages {
  app: { title: string; footer: string };
  common: { error: string };
  theme: { toLight: string; toDark: string; light: string; dark: string };
  language: { toggle: string };
  catalog: { title: string; subtitle: string; loading: string; empty: string };
  card: { view: string };
  design: {
    loading: string;
    notFound: string;
    backToCatalog: string;
    catalog: string;
    dimensions: string;
    printing: string;
    downloadStl: string;
    downloadScad: string;
  };
  notFound: { message: string; backToCatalog: string };
  viewer: {
    tab3d: string;
    tabBlueprint: string;
    tabSource: string;
    tabPhotos: string;
    viewLabel: string;
    autoRotate: string;
    wireframe: string;
    loadingModel: string;
    loadError: string;
    canvasLabel: string;
    noBlueprint: string;
    blueprintAlt: string;
    noPhotos: string;
    loadingSource: string;
    sourceError: string;
    copy: string;
    copied: string;
  };
}

const fr: Messages = {
  app: {
    title: '3DExperiment — pièces 3D partagées',
    footer: 'Pièces 3D paramétriques (OpenSCAD) — généré statiquement, hébergé sur GitHub Pages.',
  },
  common: { error: 'Erreur' },
  theme: {
    toLight: 'Activer le thème clair',
    toDark: 'Activer le thème sombre',
    light: 'Thème clair',
    dark: 'Thème sombre',
  },
  language: { toggle: 'Passer en anglais' },
  catalog: {
    title: 'Catalogue des pièces 3D',
    subtitle: 'Blueprint coté et modèle 3D interactif pour chaque pièce imprimable.',
    loading: 'Chargement du catalogue…',
    empty: 'Aucune pièce pour le moment.',
  },
  card: { view: 'Voir la pièce →' },
  design: {
    loading: 'Chargement de la pièce…',
    notFound: 'Pièce introuvable.',
    backToCatalog: '← Retour au catalogue',
    catalog: '← Catalogue',
    dimensions: 'Cotes',
    printing: 'Impression',
    downloadStl: 'Télécharger le STL',
    downloadScad: 'Source OpenSCAD (.scad)',
  },
  notFound: { message: 'Page introuvable.', backToCatalog: '← Retour au catalogue' },
  viewer: {
    tab3d: 'Modèle 3D',
    tabBlueprint: 'Blueprint',
    tabSource: 'Code source',
    tabPhotos: 'Photos',
    viewLabel: 'Vue',
    autoRotate: 'Rotation auto',
    wireframe: 'Fil de fer',
    loadingModel: 'Chargement du modèle…',
    loadError: 'Impossible de charger le modèle 3D.',
    canvasLabel: 'Viewer 3D — faites pivoter à la souris',
    noBlueprint: 'Aucun blueprint pour cette pièce.',
    blueprintAlt: 'Blueprint coté',
    noPhotos: 'Aucune photo de référence.',
    loadingSource: 'Chargement du code source…',
    sourceError: 'Impossible de charger le code source.',
    copy: 'Copier',
    copied: 'Copié !',
  },
};

const en: Messages = {
  app: {
    title: '3DExperiment — shared 3D parts',
    footer: 'Parametric 3D parts (OpenSCAD) — statically generated, hosted on GitHub Pages.',
  },
  common: { error: 'Error' },
  theme: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    light: 'Light theme',
    dark: 'Dark theme',
  },
  language: { toggle: 'Switch to French' },
  catalog: {
    title: '3D parts catalog',
    subtitle: 'Dimensioned blueprint and interactive 3D model for every printable part.',
    loading: 'Loading the catalog…',
    empty: 'No part yet.',
  },
  card: { view: 'View the part →' },
  design: {
    loading: 'Loading the part…',
    notFound: 'Part not found.',
    backToCatalog: '← Back to the catalog',
    catalog: '← Catalog',
    dimensions: 'Dimensions',
    printing: 'Printing',
    downloadStl: 'Download the STL',
    downloadScad: 'OpenSCAD source (.scad)',
  },
  notFound: { message: 'Page not found.', backToCatalog: '← Back to the catalog' },
  viewer: {
    tab3d: '3D model',
    tabBlueprint: 'Blueprint',
    tabSource: 'Source code',
    tabPhotos: 'Photos',
    viewLabel: 'View',
    autoRotate: 'Auto-rotate',
    wireframe: 'Wireframe',
    loadingModel: 'Loading the model…',
    loadError: 'Could not load the 3D model.',
    canvasLabel: '3D viewer — drag with the mouse to rotate',
    noBlueprint: 'No blueprint for this part.',
    blueprintAlt: 'Dimensioned blueprint',
    noPhotos: 'No reference photo.',
    loadingSource: 'Loading the source code…',
    sourceError: 'Could not load the source code.',
    copy: 'Copy',
    copied: 'Copied!',
  },
};

export const messages: Record<Lang, Messages> = { fr, en };
