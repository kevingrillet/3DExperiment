/**
 * Tests d'accessibilité de `LanguageSwitcher`.
 *
 * Le bouton bascule FR ⇄ EN. On vérifie :
 *  1. rôle bouton + nom accessible (libellé i18n, pas le drapeau SVG décoratif) ;
 *  2. le drapeau SVG est bien `aria-hidden` (décoratif) ;
 *  3. l'activation clavier change la langue (attribut `lang` de <html> +
 *     libellé du bouton retraduit) et persiste le choix.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { renderA11y, htmlEl } from '../test/a11y';

describe('LanguageSwitcher (a11y)', () => {
  it('expose un bouton nommé « Passer en anglais » avec un drapeau décoratif', () => {
    renderA11y(<LanguageSwitcher />);
    const btn = screen.getByRole('button', { name: 'Passer en anglais' });
    expect(btn).toHaveAttribute('title', 'Passer en anglais');
    expect(btn.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('bascule la langue au clavier (Entrée) : <html lang> et libellé mis à jour', async () => {
    const { user } = renderA11y(<LanguageSwitcher />);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(htmlEl()).toHaveAttribute('lang', 'en');
    // Une fois en anglais, le bouton propose de repasser en français.
    expect(screen.getByRole('button', { name: 'Switch to French' })).toBeInTheDocument();
    expect(window.localStorage.getItem('lang')).toBe('en');
  });
});
