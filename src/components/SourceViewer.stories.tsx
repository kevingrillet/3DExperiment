import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '../i18n/I18nProvider';
import { SourceViewer } from './SourceViewer';
import { sampleDesign } from '../test/fixtures';

/**
 * `SourceViewer` récupère la source `.scad` par `fetch(url)` puis la colore.
 * En Storybook, le fichier est servi depuis `public/` : lancer `npm run build:designs`
 * au préalable pour voir la coloration (sinon l'état d'erreur i18n s'affiche).
 */
const meta: Meta<typeof SourceViewer> = {
  title: 'Viewer/SourceViewer',
  component: SourceViewer,
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

type Story = StoryObj<typeof SourceViewer>;

export const Default: Story = {
  args: { url: sampleDesign.assets.scad, filename: 'model.scad' },
};
