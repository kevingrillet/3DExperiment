/**
 * Tests d'accessibilité de `ViewerControls` (barre d'onglets du viewer).
 *
 * On vérifie la sémantique ARIA d'un jeu d'onglets :
 *  1. un `role="tablist"` nommé, contenant des `role="tab"` ;
 *  2. `aria-selected` reflète l'onglet actif ;
 *  3. l'activation clavier d'un onglet dispatche la bonne commande (write-side) ;
 *  4. les cases à cocher (mode 3D) exposent un nom accessible et sont pilotables.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { ViewerControls } from './ViewerControls';
import { initialViewerState, type ViewerState } from '../application/viewer/viewer';
import { renderA11y } from '../test/a11y';

function state(overrides: Partial<ViewerState> = {}): ViewerState {
  return { ...initialViewerState, ...overrides };
}

describe('ViewerControls (a11y)', () => {
  it('expose un tablist nommé avec l’onglet actif marqué aria-selected', () => {
    renderA11y(<ViewerControls state={state({ view: '3d' })} onCommand={() => {}} />);
    const tablist = screen.getByRole('tablist', { name: 'Vue' });
    const tab3d = within(tablist).getByRole('tab', { name: 'Modèle 3D' });
    expect(tab3d).toHaveAttribute('aria-selected', 'true');
    expect(within(tablist).getByRole('tab', { name: 'Blueprint' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('dispatche une commande setView à l’activation clavier d’un onglet', async () => {
    const onCommand = vi.fn();
    const { user } = renderA11y(<ViewerControls state={state()} onCommand={onCommand} />);
    const tabSource = screen.getByRole('tab', { name: 'Code source' });
    tabSource.focus();
    await user.keyboard('{Enter}');
    expect(onCommand).toHaveBeenCalledWith({ type: 'SetView', view: 'scad' });
  });

  it('les cases à cocher du mode 3D ont un nom accessible et sont pilotables', async () => {
    const onCommand = vi.fn();
    const { user } = renderA11y(
      <ViewerControls state={state({ view: '3d', autoRotate: false })} onCommand={onCommand} />,
    );
    const autoRotate = screen.getByRole('checkbox', { name: 'Rotation auto' });
    expect(autoRotate).not.toBeChecked();
    await user.click(autoRotate);
    expect(onCommand).toHaveBeenCalledWith({ type: 'SetAutoRotate', value: true });
  });
});
