import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryBusProvider, useQuery, useQueryBus } from './queryBus';
import { listDesigns } from '../application/queries/listDesigns';
import { getDesign } from '../application/queries/getDesign';
import { makeTestBus } from '../test/bus';
import { sampleDesign } from '../test/fixtures';

function ListConsumer() {
  const { data, loading } = useQuery(() => listDesigns('fr'), []);
  if (loading) return <span>chargement</span>;
  return <span>{data?.length} pièce(s)</span>;
}

function ErrorConsumer() {
  // Query sans handler enregistré → le bus lève → état error.
  const { error, loading } = useQuery(() => getDesign('x', 'fr'), []);
  if (loading) return <span>chargement</span>;
  return <span>{error ? `erreur: ${error.message}` : 'ok'}</span>;
}

describe('queryBus (provider + hooks)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('useQueryBus lève hors d’un QueryBusProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bare() {
      useQueryBus();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/QueryBusProvider/);
  });

  it('useQuery expose les données résolues par le bus', async () => {
    render(
      <QueryBusProvider bus={makeTestBus()}>
        <ListConsumer />
      </QueryBusProvider>,
    );
    expect(await screen.findByText('1 pièce(s)')).toBeInTheDocument();
  });

  it('useQuery expose l’erreur quand le bus rejette', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const bus = makeTestBus();
    vi.spyOn(bus, 'ask').mockRejectedValue(new Error('boum'));
    render(
      <QueryBusProvider bus={bus}>
        <ErrorConsumer />
      </QueryBusProvider>,
    );
    await waitFor(() => expect(screen.getByText('erreur: boum')).toBeInTheDocument());
  });

  it('un QueryBusProvider sans bus injecté se câble par défaut', () => {
    // Couvre la branche d'init paresseuse (createDefaultQueryBus).
    render(
      <QueryBusProvider>
        <span>ok</span>
      </QueryBusProvider>,
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('réutilise la pièce d’exemple comme cible de getDesign', async () => {
    const bus = makeTestBus();
    expect(await bus.ask(getDesign(sampleDesign.id, 'fr'))).not.toBeNull();
  });
});
