import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StlViewer } from './StlViewer';

// react-three-fiber/drei ont besoin d'un contexte WebGL absent de jsdom :
// on remplace Canvas par un conteneur DOM et les helpers par des passe-plats,
// ce qui permet de couvrir le câblage du composant (props, thème, sous-arbre).
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, 'aria-label': label }: { children: ReactNode; 'aria-label'?: string }) => (
    <div data-testid="canvas" aria-label={label}>
      {children}
    </div>
  ),
  useLoader: () => ({ computeVertexNormals: vi.fn() }),
}));
vi.mock('@react-three/drei', () => ({
  Bounds: ({ children }: { children: ReactNode }) => <>{children}</>,
  Center: ({ children }: { children: ReactNode }) => <>{children}</>,
  Grid: () => null,
  Html: ({ children }: { children: ReactNode }) => <>{children}</>,
  OrbitControls: () => null,
}));
vi.mock('three/examples/jsm/loaders/STLLoader.js', () => ({ STLLoader: class {} }));

describe('StlViewer', () => {
  it('rend le canvas 3D avec un label accessible', () => {
    render(<StlViewer url="model.stl" autoRotate wireframe={false} />);
    expect(screen.getByLabelText('Viewer 3D — faites pivoter à la souris')).toBeInTheDocument();
  });

  it('accepte le mode fil de fer sans planter', () => {
    render(<StlViewer url="model.stl" autoRotate={false} wireframe />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
