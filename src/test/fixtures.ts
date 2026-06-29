import type { Design } from '../domain/design';

export const sampleDesign: Design = {
  id: 'pied_babyfoot_monneret',
  title: 'Pied baby-foot Monneret',
  subtitle: 'Patin / sabot de pied',
  description:
    'Coin plein qui coiffe le pied bois du baby-foot : le bois se loge dans un creux sur la face inclinée du dessus, et une vis le fixe.',
  tags: ['babyfoot', 'réparation', 'patin'],
  dimensions: [
    { label: 'Longueur totale', value: '101 mm' },
    { label: 'Largeur', value: '28 mm' },
    { label: 'Hauteur (épais → fin)', value: '35 → 6 mm' },
  ],
  printing: [
    { label: 'Matière', value: 'PETG ou Nylon (PA)' },
    { label: 'Remplissage', value: '40 % minimum' },
  ],
  assets: {
    stl: 'designs/pied_babyfoot_monneret/model.stl',
    scad: 'designs/pied_babyfoot_monneret/model.scad',
    blueprint: 'designs/pied_babyfoot_monneret/blueprint.svg',
  },
  photos: [
    { url: 'designs/pied_babyfoot_monneret/photos/plan.jpg', caption: "Plan coté d'origine" },
  ],
};
