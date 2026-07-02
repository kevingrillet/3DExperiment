import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '../i18n/I18nProvider';
import { PhotoGallery } from './PhotoGallery';

const meta: Meta<typeof PhotoGallery> = {
  title: 'Viewer/PhotoGallery',
  component: PhotoGallery,
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="w-[40rem] max-w-full">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof PhotoGallery>;

// Photos de démonstration (images inline SVG en data-URI : story autoportante).
const photo = (label: string, color: string) => ({
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="${color}"/><text x="160" y="95" font-family="sans-serif" font-size="20" fill="#fff" text-anchor="middle">${label}</text></svg>`,
  )}`,
  caption: label,
});

export const Grille: Story = {
  args: {
    photos: [
      photo('Plan coté', '#1330a0'),
      photo('Pièce réelle', '#0a7d34'),
      photo('Autre angle', '#c0392b'),
    ],
  },
};

/** Aucune photo : état vide explicite (message i18n). */
export const SansPhoto: Story = {
  args: { photos: [] },
};
