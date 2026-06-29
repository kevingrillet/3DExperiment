import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('affiche le 404 et un lien retour vers le catalogue', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page introuvable.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Retour au catalogue' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
