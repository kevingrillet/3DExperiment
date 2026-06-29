import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DesignPage } from './DesignPage';
import { QueryBusProvider } from '../app/queryBus';
import { makeTestBus } from '../test/bus';
import { sampleDesign } from '../test/fixtures';

// Le DesignViewer embarque le viewer 3D (WebGL) : on le stub pour cette page.
vi.mock('../components/DesignViewer', () => ({
  DesignViewer: () => <div data-testid="design-viewer" />,
}));

function renderAt(id: string, bus = makeTestBus()) {
  return render(
    <QueryBusProvider bus={bus}>
      <MemoryRouter initialEntries={[`/design/${id}`]}>
        <Routes>
          <Route path="/design/:id" element={<DesignPage />} />
        </Routes>
      </MemoryRouter>
    </QueryBusProvider>,
  );
}

describe('DesignPage', () => {
  it('affiche la pièce avec ses liens de téléchargement', async () => {
    renderAt(sampleDesign.id);
    expect(await screen.findByRole('heading', { name: sampleDesign.title })).toBeInTheDocument();
    expect(screen.getByTestId('design-viewer')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Télécharger le STL' })).toHaveAttribute(
      'href',
      sampleDesign.assets.stl,
    );
    expect(screen.getByRole('link', { name: 'Source OpenSCAD (.scad)' })).toHaveAttribute(
      'href',
      sampleDesign.assets.scad,
    );
  });

  it('affiche « introuvable » pour un id inconnu', async () => {
    renderAt('inexistant');
    expect(await screen.findByText('Pièce introuvable.')).toBeInTheDocument();
  });
});
