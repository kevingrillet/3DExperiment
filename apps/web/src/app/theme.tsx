/**
 * Thème clair / sombre — contexte React léger.
 *
 * Stratégie (identique au script inline d'`index.html` qui évite le flash) :
 *  1. on lit la préférence enregistrée dans localStorage (clé "theme") ;
 *  2. à défaut, on suit la préférence système (`prefers-color-scheme`) ;
 *  3. le thème est appliqué via la classe `dark` sur <html> ; les tokens CSS
 *     (`--color-canvas`, `--color-fg`…) basculent alors dans `src/index.css`.
 *
 * Un contexte (plutôt qu'un simple hook) permet aux composants profonds — en
 * particulier le viewer 3D, dont le fond/grille sont peints en JS — de réagir au
 * changement de thème.
 */
/* eslint-disable react-refresh/only-export-components --
   Provider + hook useTheme + getInitialTheme = l'API publique cohérente du thème. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/** Détermine le thème initial à partir de localStorage puis du système. */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage indisponible (mode privé, etc.) : on ignore. */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applique le thème au document et le persiste. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  // On coupe les transitions le temps de la bascule pour que fond, cartes et
  // boutons changent de couleur ensemble (sinon effet de désynchronisation),
  // puis on les réactive une fois le nouveau thème peint (double rAF).
  root.classList.add('theme-switching');
  root.classList.toggle('dark', theme === 'dark');
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.remove('theme-switching'));
  });
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage indisponible : on ignore la persistance. */
  }
}

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

/** Accès au thème courant depuis n'importe quel composant. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
