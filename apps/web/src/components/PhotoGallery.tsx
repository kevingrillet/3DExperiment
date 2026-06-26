import type { Photo } from '../domain/design';
import { useI18n } from '../i18n/I18nProvider';

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const { t } = useI18n();
  if (photos.length === 0) {
    return (
      <div className="flex h-full min-h-[20rem] items-center justify-center rounded-lg border border-dashed border-line text-faint">
        {t('viewer.noPhotos')}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {photos.map((photo) => (
        <figure
          key={photo.url}
          className="overflow-hidden rounded-lg border border-line bg-surface"
        >
          <img src={photo.url} alt={photo.caption} className="aspect-video w-full object-cover" />
          {photo.caption && (
            <figcaption className="px-3 py-2 text-sm text-muted">{photo.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
