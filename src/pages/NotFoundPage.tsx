import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-faint">404</p>
      <p className="mt-2 text-muted">{t('notFound.message')}</p>
      <Link to="/" className="mt-4 inline-block font-medium text-ink">
        {t('notFound.backToCatalog')}
      </Link>
    </div>
  );
}
