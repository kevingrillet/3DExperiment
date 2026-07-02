import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '../i18n/I18nProvider';
import { BlueprintViewer } from './BlueprintViewer';
import { sampleDesign } from '../test/fixtures';

const meta: Meta<typeof BlueprintViewer> = {
  title: 'Viewer/BlueprintViewer',
  component: BlueprintViewer,
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

type Story = StoryObj<typeof BlueprintViewer>;

/** Blueprint présent : image SVG servie depuis `public/` (lancer `npm run build:designs`). */
export const AvecBlueprint: Story = {
  args: { url: sampleDesign.assets.blueprint, title: sampleDesign.title },
};

/** Pièce sans blueprint : état vide explicite (message i18n). */
export const SansBlueprint: Story = {
  args: { url: null, title: sampleDesign.title },
};
