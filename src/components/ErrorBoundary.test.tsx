import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rend les enfants quand tout va bien', () => {
    render(
      <ErrorBoundary fallback={<div>repli</div>}>
        <div>contenu</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('contenu')).toBeInTheDocument();
    expect(screen.queryByText('repli')).not.toBeInTheDocument();
  });

  it('affiche le fallback quand un enfant lève une erreur', () => {
    // L'erreur capturée est journalisée par componentDidCatch : on la fait taire.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>repli</div>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('repli')).toBeInTheDocument();
  });
});
