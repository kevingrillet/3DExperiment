import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceViewer } from './SourceViewer';

function mockFetch(impl: () => Promise<Partial<Response>>) {
  vi.stubGlobal('fetch', vi.fn(impl) as unknown as typeof fetch);
}

describe('SourceViewer', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('affiche un spinner pendant le chargement', () => {
    mockFetch(() => new Promise(() => {})); // jamais résolu
    render(<SourceViewer url="model.scad" />);
    expect(screen.getByText('Chargement du code source…')).toBeInTheDocument();
  });

  it('affiche le code tokenisé et permet de le copier', async () => {
    mockFetch(() => Promise.resolve({ ok: true, text: () => Promise.resolve('cube(10);') }));
    render(<SourceViewer url="model.scad" filename="piece.scad" />);

    await waitFor(() => expect(screen.getByText('piece.scad')).toBeInTheDocument());
    // Le nom de fichier et la numérotation de ligne apparaissent.
    expect(screen.getByText('1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Copier' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('cube(10);');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Copié !' })).toBeInTheDocument(),
    );
  });

  it('affiche un message d’erreur si le fetch échoue', async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') }));
    render(<SourceViewer url="model.scad" />);
    await waitFor(() =>
      expect(screen.getByText('Impossible de charger le code source.')).toBeInTheDocument(),
    );
  });
});
