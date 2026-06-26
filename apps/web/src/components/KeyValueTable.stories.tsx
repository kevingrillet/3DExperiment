import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyValueTable } from './KeyValueTable';
import { sampleDesign } from '../test/fixtures';

const meta: Meta<typeof KeyValueTable> = {
  title: 'Pièce/KeyValueTable',
  component: KeyValueTable,
};
export default meta;

type Story = StoryObj<typeof KeyValueTable>;

export const Cotes: Story = {
  args: { title: 'Cotes', rows: sampleDesign.dimensions },
};

export const Impression: Story = {
  args: { title: 'Impression', rows: sampleDesign.printing },
};
