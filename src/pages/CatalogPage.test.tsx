import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';
import { QueryBusProvider } from '../app/queryBus';
import { makeTestBus } from '../test/bus';
import { sampleDesign } from '../test/fixtures';

function renderPage(bus = makeTestBus()) {
  return render(
    <QueryBusProvider bus={bus}>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </QueryBusProvider>,
  );
}

describe('CatalogPage', () => {
  it('affiche le titre et les cartes des pièces', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Catalogue des pièces 3D' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: sampleDesign.title })).toBeInTheDocument();
  });

  it('affiche un message quand le catalogue est vide', async () => {
    renderPage(makeTestBus([]));
    await waitFor(() =>
      expect(screen.getByText('Aucune pièce pour le moment.')).toBeInTheDocument(),
    );
  });
});
