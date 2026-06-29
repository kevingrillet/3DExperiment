import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('expose un rôle status et le label par défaut', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Chargement…')).toBeInTheDocument();
  });

  it('affiche un label personnalisé', () => {
    render(<Spinner label="Chargement du modèle…" />);
    expect(screen.getByText('Chargement du modèle…')).toBeInTheDocument();
  });
});
