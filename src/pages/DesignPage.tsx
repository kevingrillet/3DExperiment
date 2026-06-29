import { Link, useParams } from 'react-router-dom';
import { useQuery } from '../app/queryBus';
import { getDesign } from '../application/queries/getDesign';
import { DesignViewer } from '../components/DesignViewer';
import { KeyValueTable } from '../components/KeyValueTable';
import { Spinner } from '../components/Spinner';
import { Tag } from '../components/Tag';
import { useI18n } from '../i18n/I18nProvider';

export function DesignPage() {
  const { t, lang } = useI18n();
  const { id = '' } = useParams();
  const { data, loading, error } = useQuery(() => getDesign(id, lang), [id, lang]);

  if (loading) return <Spinner label={t('design.loading')} />;
  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
        {t('common.error')} : {error.message}
      </p>
    );
  }
  if (!data) {
    return (
      <div className="text-center text-muted">
        <p>{t('design.notFound')}</p>
        <Link to="/" className="mt-2 inline-block font-medium text-ink">
          {t('design.backToCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <article>
      <Link to="/" className="text-sm font-medium text-ink">
        {t('design.catalog')}
      </Link>
      <header className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-fg-strong">{data.title}</h1>
        {data.subtitle && <p className="text-muted">{data.subtitle}</p>}
        {data.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DesignViewer design={data} />
        </div>
        <aside className="flex flex-col gap-6">
          <p className="text-sm leading-relaxed text-muted">{data.description}</p>
          <KeyValueTable title={t('design.dimensions')} rows={data.dimensions} />
          <KeyValueTable title={t('design.printing')} rows={data.printing} />
          <a
            href={data.assets.stl}
            download
            className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-accent/90"
          >
            {t('design.downloadStl')}
          </a>
          <a
            href={data.assets.scad}
            download
            className="-mt-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-center text-sm font-medium text-fg transition hover:bg-subtle"
          >
            {t('design.downloadScad')}
          </a>
        </aside>
      </div>
    </article>
  );
}
