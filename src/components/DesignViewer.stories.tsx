import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '../i18n/I18nProvider';
import { ThemeProvider } from '../app/theme';
import { DesignViewer } from './DesignViewer';
import { sampleDesign } from '../test/fixtures';

/**
 * Panneau composite d'une pièce : onglets 3D / blueprint / code source / photos,
 * pilotés par le viewerReducer (write-side du CQRS). Les assets (STL, SVG, .scad)
 * sont servis depuis `public/` : lancer `npm run build:designs` pour un rendu complet.
 */
const meta: Meta<typeof DesignViewer> = {
  title: 'Viewer/DesignViewer',
  component: DesignViewer,
  decorators: [
    (Story) => (
      <I18nProvider>
        <ThemeProvider>
          <div className="w-[48rem] max-w-full">
            <Story />
          </div>
        </ThemeProvider>
      </I18nProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DesignViewer>;

export const Default: Story = {
  args: { design: sampleDesign },
};
