/**
 * Tests d'accessibilité de `ThemeToggle`.
 *
 * `ThemeToggle` lit le thème depuis le contexte (`useTheme`) : on le rend donc
 * sous `<ThemeProvider>` (via `renderA11y`) pour tester le comportement réel :
 *  1. rôle / nom accessible / titre selon l'état (clair vs sombre) ;
 *  2. activation clavier (Entrée / Espace) qui bascule vraiment la classe `dark`.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { renderA11y, htmlEl } from '../test/a11y';

describe('ThemeToggle (a11y)', () => {
  it('en mode clair : nom accessible « activer le thème sombre » et icône décorative', () => {
    renderA11y(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: 'Activer le thème sombre' });
    expect(btn).toHaveAttribute('title', 'Thème sombre');
    // L'emoji est purement décoratif : il ne doit pas polluer le nom accessible.
    expect(btn.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('est activable au clavier (Tab puis Entrée) et bascule la classe dark', async () => {
    const { user } = renderA11y(<ThemeToggle />);
    expect(htmlEl()).not.toHaveClass('dark');

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(htmlEl()).toHaveClass('dark');
    // Le nom accessible et le titre reflètent le nouvel état.
    expect(screen.getByRole('button', { name: 'Activer le thème clair' })).toHaveAttribute(
      'title',
      'Thème clair',
    );
  });

  it('persiste le thème choisi dans localStorage', async () => {
    const { user } = renderA11y(<ThemeToggle />);
    await user.click(screen.getByRole('button'));
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });
});
