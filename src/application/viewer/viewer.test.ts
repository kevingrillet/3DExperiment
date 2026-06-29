import { describe, expect, it } from 'vitest';
import { initialViewerState, viewerCommands, viewerReducer, type ViewerState } from './viewer';

describe('viewerReducer', () => {
  it('change la vue active', () => {
    const next = viewerReducer(initialViewerState, viewerCommands.setView('blueprint'));
    expect(next.view).toBe('blueprint');
  });

  it('active/désactive la rotation auto', () => {
    const next = viewerReducer(initialViewerState, viewerCommands.setAutoRotate(false));
    expect(next.autoRotate).toBe(false);
  });

  it('bascule le fil de fer', () => {
    const once = viewerReducer(initialViewerState, viewerCommands.toggleWireframe());
    expect(once.wireframe).toBe(true);
    const twice = viewerReducer(once, viewerCommands.toggleWireframe());
    expect(twice.wireframe).toBe(false);
  });

  it('réinitialise tout', () => {
    const dirty: ViewerState = { view: 'photos', autoRotate: false, wireframe: true };
    expect(viewerReducer(dirty, viewerCommands.reset())).toEqual(initialViewerState);
  });

  it('ne mute pas l’état précédent (immutabilité)', () => {
    const next = viewerReducer(initialViewerState, viewerCommands.setView('photos'));
    expect(next).not.toBe(initialViewerState);
    expect(initialViewerState.view).toBe('3d');
  });
});
