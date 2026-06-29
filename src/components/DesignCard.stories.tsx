import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { DesignCard } from './DesignCard';
import { sampleDesign } from '../test/fixtures';

const meta: Meta<typeof DesignCard> = {
  title: 'Catalogue/DesignCard',
  component: DesignCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-80">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DesignCard>;

export const Default: Story = {
  args: { design: sampleDesign },
};

export const SansTags: Story = {
  args: { design: { ...sampleDesign, tags: [] } },
};
