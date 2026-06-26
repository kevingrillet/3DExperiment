import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage';
import { DesignPage } from './pages/DesignPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { useI18n } from './i18n/I18nProvider';

export function App() {
  const { t } = useI18n();
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col bg-canvas text-fg">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-6 py-4">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-ink">
              <span aria-hidden className="text-2xl">
                🧩
              </span>
              3DExperiment
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/design/:id" element={<DesignPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="border-t border-line bg-surface py-4 text-center text-sm text-faint">
          {t('app.footer')}
        </footer>
      </div>
    </HashRouter>
  );
}
