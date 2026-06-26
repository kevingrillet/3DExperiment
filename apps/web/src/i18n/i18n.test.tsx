import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useI18n, getInitialLang } from './I18nProvider';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

function Probe() {
  const { lang, t } = useI18n();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{t('catalog.title')}</span>
      <span data-testid="missing">{t('does.not.exist')}</span>
    </div>
  );
}

describe('i18n', () => {
  beforeEach(() => window.localStorage.clear());

  it('getInitialLang : préférence stockée prioritaire sur le navigateur', () => {
    window.localStorage.setItem('lang', 'en');
    expect(getInitialLang()).toBe('en');
  });

  it('getInitialLang : retombe sur le navigateur (fr) sans préférence', () => {
    expect(getInitialLang()).toBe('fr');
  });

  it('rend en français par défaut et renvoie la clé si absente', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('fr');
    expect(screen.getByTestId('title')).toHaveTextContent('Catalogue des pièces 3D');
    expect(screen.getByTestId('missing')).toHaveTextContent('does.not.exist');
  });

  it('LanguageSwitcher bascule fr ⇄ en et persiste', async () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('fr');
    await userEvent.click(screen.getByRole('button', { name: 'Passer en anglais' }));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('title')).toHaveTextContent('3D parts catalog');
    expect(window.localStorage.getItem('lang')).toBe('en');
  });
});
