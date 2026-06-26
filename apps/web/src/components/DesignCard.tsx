import { Link } from 'react-router-dom';
import type { DesignSummary } from '../domain/design';
import { Tag } from './Tag';
import { useI18n } from '../i18n/I18nProvider';

export function DesignCard({ design }: { design: DesignSummary }) {
  const { t } = useI18n();
  return (
    <Link
      to={`/design/${design.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-fg-strong group-hover:text-ink">{design.title}</h2>
      {design.subtitle && <p className="text-sm text-muted">{design.subtitle}</p>}
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{design.description}</p>
      {design.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {design.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}
      <span className="mt-4 text-sm font-medium text-ink">{t('card.view')}</span>
    </Link>
  );
}
