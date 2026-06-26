// =====================================================================
//  Côté ÉCRITURE du CQRS : l'état du viewer 3D/blueprint.
//
//  Les ViewerCommand sont des intentions de mutation ; viewerReducer
//  est leur unique handler (pattern command → reducer). Les composants
//  ne mutent jamais l'état directement : ils dispatchent une commande.
// =====================================================================

export type ViewMode = '3d' | 'blueprint' | 'scad' | 'photos';

export interface ViewerState {
  view: ViewMode;
  autoRotate: boolean;
  wireframe: boolean;
}

export const initialViewerState: ViewerState = {
  view: '3d',
  autoRotate: true,
  wireframe: false,
};

export type ViewerCommand =
  | { type: 'SetView'; view: ViewMode }
  | { type: 'SetAutoRotate'; value: boolean }
  | { type: 'ToggleWireframe' }
  | { type: 'ResetViewer' };

/** Fabriques de commandes (expriment l'intention sans connaître l'état). */
export const viewerCommands = {
  setView: (view: ViewMode): ViewerCommand => ({ type: 'SetView', view }),
  setAutoRotate: (value: boolean): ViewerCommand => ({ type: 'SetAutoRotate', value }),
  toggleWireframe: (): ViewerCommand => ({ type: 'ToggleWireframe' }),
  reset: (): ViewerCommand => ({ type: 'ResetViewer' }),
};

export function viewerReducer(state: ViewerState, command: ViewerCommand): ViewerState {
  switch (command.type) {
    case 'SetView':
      return { ...state, view: command.view };
    case 'SetAutoRotate':
      return { ...state, autoRotate: command.value };
    case 'ToggleWireframe':
      return { ...state, wireframe: !state.wireframe };
    case 'ResetViewer':
      return initialViewerState;
    default:
      return state;
  }
}
