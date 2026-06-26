import { useQuery } from '../app/queryBus';
import { listDesigns } from '../application/queries/listDesigns';
import { DesignCard } from '../components/DesignCard';
import { Spinner } from '../components/Spinner';
import { useI18n } from '../i18n/I18nProvider';

export function CatalogPage() {
  const { t, lang } = useI18n();
  const { data, loading, error } = useQuery(() => listDesigns(lang), [lang]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-fg-strong">{t('catalog.title')}</h1>
        <p className="mt-1 text-muted">{t('catalog.subtitle')}</p>
      </header>

      {loading && <Spinner label={t('catalog.loading')} />}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {t('common.error')} : {error.message}
        </p>
      )}
      {data && data.length === 0 && <p className="text-muted">{t('catalog.empty')}</p>}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
