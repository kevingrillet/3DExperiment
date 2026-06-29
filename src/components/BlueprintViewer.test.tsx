import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlueprintViewer } from './BlueprintViewer';

describe('BlueprintViewer', () => {
  it('affiche un message quand la pièce n’a pas de blueprint', () => {
    render(<BlueprintViewer url={null} title="Pied" />);
    expect(screen.getByText('Aucun blueprint pour cette pièce.')).toBeInTheDocument();
  });

  it('affiche l’image du blueprint avec un alt incluant le titre', () => {
    render(<BlueprintViewer url="plan.svg" title="Pied" />);
    const img = screen.getByRole('img', { name: /Blueprint coté — Pied/ });
    expect(img).toHaveAttribute('src', 'plan.svg');
  });
});
