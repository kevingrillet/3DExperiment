/**
 * Boîte à outils pour les tests d'accessibilité (a11y) unitaires.
 *
 * STYLE DE RÉFÉRENCE pour les tests a11y de ce projet (aligné sur le socle
 * NodeTemplate). Un bon test a11y vérifie l'expérience réelle plutôt que le
 * markup :
 *
 *  - rôle + nom accessible (`getByRole(role, { name })`) plutôt que classes CSS ;
 *  - attributs ARIA d'état (`aria-pressed`, `aria-label`, `aria-selected`…) ;
 *  - navigation clavier (Tab / Entrée / Espace / flèches) via `user-event` ;
 *  - effets observables sur le DOM (classe `dark`, `lang`) et sur `localStorage`
 *    (persistance) — le comportement, pas l'implémentation.
 *
 * Les composants d'en-tête consomment les contextes i18n ET thème : on rend donc
 * toujours sous `<I18nProvider>` (libellés réels = noms accessibles) et
 * `<ThemeProvider>` (bascule clair/sombre réellement câblée).
 */
import type { ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n/I18nProvider';
import { ThemeProvider } from '../app/theme';

/** Rend un composant sous les contextes i18n + thème (libellés et bascule réels)
 *  et renvoie un `user` prêt à l'emploi pour des interactions déterministes. */
export function renderA11y(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <I18nProvider>
        <ThemeProvider>{ui}</ThemeProvider>
      </I18nProvider>,
      options,
    ),
  };
}

/** Raccourci lisible : l'élément <html> sur lequel `.dark` / `lang` sont posés. */
export function htmlEl(): HTMLElement {
  return document.documentElement;
}
