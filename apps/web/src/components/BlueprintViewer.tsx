import { useI18n } from '../i18n/I18nProvider';

export function BlueprintViewer({ url, title }: { url: string | null; title: string }) {
  const { t } = useI18n();
  if (!url) {
    return (
      <div className="flex h-full min-h-[20rem] items-center justify-center rounded-lg border border-dashed border-line text-faint">
        {t('viewer.noBlueprint')}
      </div>
    );
  }
  return (
    <div className="overflow-auto rounded-lg border border-line bg-surface p-2">
      <img
        src={url}
        alt={`${t('viewer.blueprintAlt')} — ${title}`}
        className="mx-auto h-auto max-w-full"
      />
    </div>
  );
}
