import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme, getInitialTheme } from './theme';
import { ThemeToggle } from '../components/ThemeToggle';

function Probe() {
  const { theme } = useTheme();
  return <span data-testid="theme">{theme}</span>;
}

describe('thème', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('getInitialTheme : préférence stockée prioritaire', () => {
    window.localStorage.setItem('theme', 'dark');
    expect(getInitialTheme()).toBe('dark');
  });

  it('getInitialTheme : clair par défaut (matchMedia sans préférence sombre)', () => {
    expect(getInitialTheme()).toBe('light');
  });

  it('ThemeToggle bascule clair ⇄ sombre, applique la classe et persiste', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    await userEvent.click(screen.getByRole('button', { name: 'Activer le thème sombre' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');

    await userEvent.click(screen.getByRole('button', { name: 'Activer le thème clair' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
