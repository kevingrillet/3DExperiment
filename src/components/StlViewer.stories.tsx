import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '../i18n/I18nProvider';
import { ThemeProvider } from '../app/theme';
import { StlViewer } from './StlViewer';
import { sampleDesign } from '../test/fixtures';

/**
 * `StlViewer` rend un canvas WebGL (react-three-fiber) : il nécessite un vrai
 * navigateur (Storybook), pas jsdom. Le STL est chargé depuis `public/` : lancer
 * `npm run build:designs` au préalable, sinon le garde-fou (ErrorBoundary) affiche
 * le message d'erreur i18n. Story volontairement MINIMALE (câblage + contrôles).
 */
const meta: Meta<typeof StlViewer> = {
  title: 'Viewer/StlViewer',
  component: StlViewer,
  args: {
    url: sampleDesign.assets.stl,
    autoRotate: true,
    wireframe: false,
  },
  argTypes: {
    autoRotate: { control: 'boolean' },
    wireframe: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <I18nProvider>
        <ThemeProvider>
          <div className="h-[28rem] w-[40rem] max-w-full">
            <Story />
          </div>
        </ThemeProvider>
      </I18nProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof StlViewer>;

export const Default: Story = {};

export const FilDeFer: Story = {
  args: { wireframe: true, autoRotate: false },
};
