import { useReducer } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewerControls } from './ViewerControls';
import { initialViewerState, viewerReducer } from '../application/viewer/viewer';

const meta: Meta<typeof ViewerControls> = {
  title: 'Viewer/ViewerControls',
  component: ViewerControls,
};
export default meta;

type Story = StoryObj<typeof ViewerControls>;

/** Branché sur le vrai viewerReducer (côté commandes) pour voir l'état évoluer. */
function InteractiveDemo() {
  const [state, dispatch] = useReducer(viewerReducer, initialViewerState);
  return (
    <div className="w-[36rem]">
      <ViewerControls state={state} onCommand={dispatch} />
      <pre className="mt-4 rounded bg-slate-100 p-3 text-xs">{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

export const Interactif: Story = {
  render: () => <InteractiveDemo />,
};
