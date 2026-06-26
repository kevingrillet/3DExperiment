import { useReducer } from 'react';
import { initialViewerState, viewerReducer } from '../application/viewer/viewer';
import type { Design } from '../domain/design';
import { ViewerControls } from './ViewerControls';
import { StlViewer } from './StlViewer';
import { BlueprintViewer } from './BlueprintViewer';
import { SourceViewer } from './SourceViewer';
import { PhotoGallery } from './PhotoGallery';

/**
 * Panneau interactif d'une pièce : onglets 3D / blueprint / code source / photos.
 * L'état est piloté par le viewerReducer (côté écriture du CQRS) ;
 * les composants ne font que dispatcher des commandes.
 */
export function DesignViewer({ design }: { design: Design }) {
  const [state, dispatch] = useReducer(viewerReducer, initialViewerState);

  return (
    <div className="flex flex-col gap-4">
      <ViewerControls state={state} onCommand={dispatch} />
      <div className="w-full">
        {/* La vue 3D a besoin d'une hauteur définie (le canvas est en h-full) ;
            les autres vues se dimensionnent naturellement. */}
        {state.view === '3d' && (
          <div className="h-[28rem]">
            <StlViewer
              url={design.assets.stl}
              autoRotate={state.autoRotate}
              wireframe={state.wireframe}
            />
          </div>
        )}
        {state.view === 'blueprint' && (
          <BlueprintViewer url={design.assets.blueprint} title={design.title} />
        )}
        {state.view === 'scad' && <SourceViewer url={design.assets.scad} />}
        {state.view === 'photos' && <PhotoGallery photos={design.photos} />}
      </div>
    </div>
  );
}
