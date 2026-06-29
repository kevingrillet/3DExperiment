import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesignViewer } from './DesignViewer';
import { sampleDesign } from '../test/fixtures';

// Le viewer 3D (WebGL) n'est pas testable en jsdom : on le remplace par un stub.
vi.mock('./StlViewer', () => ({
  StlViewer: () => <div data-testid="stl-viewer" />,
}));
// SourceViewer fait un fetch au montage : stub pour éviter un appel réseau réel.
vi.mock('./SourceViewer', () => ({
  SourceViewer: () => <div data-testid="source-viewer" />,
}));

describe('DesignViewer', () => {
  afterEach(() => vi.restoreAllMocks());

  it('affiche la vue 3D par défaut', () => {
    render(<DesignViewer design={sampleDesign} />);
    expect(screen.getByTestId('stl-viewer')).toBeInTheDocument();
  });

  it('bascule entre les onglets blueprint, code source et photos', async () => {
    render(<DesignViewer design={sampleDesign} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Blueprint' }));
    expect(screen.getByRole('img', { name: /Blueprint coté/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Code source' }));
    expect(screen.getByTestId('source-viewer')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Photos' }));
    expect(screen.getByRole('img', { name: sampleDesign.photos[0].caption })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Modèle 3D' }));
    expect(screen.getByTestId('stl-viewer')).toBeInTheDocument();
  });
});
