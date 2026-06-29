/**
 * Bouton de bascule entre thème clair et sombre (lit le thème depuis le contexte).
 */
import { useTheme } from '../app/theme';
import { useI18n } from '../i18n/I18nProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-xl text-fg transition hover:bg-subtle"
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}
