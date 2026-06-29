import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewerControls } from './ViewerControls';
import { initialViewerState } from '../application/viewer/viewer';

describe('ViewerControls', () => {
  it('dispatche SetView au clic sur un onglet', async () => {
    const onCommand = vi.fn();
    render(<ViewerControls state={initialViewerState} onCommand={onCommand} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Blueprint' }));
    expect(onCommand).toHaveBeenCalledWith({ type: 'SetView', view: 'blueprint' });
  });

  it('marque l’onglet actif via aria-selected', () => {
    render(<ViewerControls state={initialViewerState} onCommand={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Modèle 3D' })).toHaveAttribute('aria-selected', 'true');
  });

  it('n’affiche les options 3D que sur la vue 3D', () => {
    const { rerender } = render(<ViewerControls state={initialViewerState} onCommand={vi.fn()} />);
    expect(screen.getByText('Rotation auto')).toBeInTheDocument();
    rerender(
      <ViewerControls state={{ ...initialViewerState, view: 'blueprint' }} onCommand={vi.fn()} />,
    );
    expect(screen.queryByText('Rotation auto')).not.toBeInTheDocument();
  });
});
