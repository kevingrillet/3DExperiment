import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { QueryBusProvider } from './app/queryBus';
import { makeTestBus } from './test/bus';

// La page catalogue rend des DesignViewer indirectement ? Non : seules les cartes.
// Mais par sécurité, on stub le viewer 3D au cas où une carte y mènerait.
vi.mock('./components/StlViewer', () => ({ StlViewer: () => <div /> }));

describe('App', () => {
  it('affiche l’en-tête, la navigation et le pied de page', () => {
    render(
      <QueryBusProvider bus={makeTestBus()}>
        <App />
      </QueryBusProvider>,
    );
    expect(screen.getByRole('link', { name: /3DExperiment/ })).toBeInTheDocument();
    expect(screen.getByText(/hébergé sur GitHub Pages/)).toBeInTheDocument();
  });
});
