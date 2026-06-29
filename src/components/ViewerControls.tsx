import {
  viewerCommands,
  type ViewerCommand,
  type ViewerState,
  type ViewMode,
} from '../application/viewer/viewer';
import { useI18n } from '../i18n/I18nProvider';

const TABS: { mode: ViewMode; labelKey: string }[] = [
  { mode: '3d', labelKey: 'viewer.tab3d' },
  { mode: 'blueprint', labelKey: 'viewer.tabBlueprint' },
  { mode: 'scad', labelKey: 'viewer.tabSource' },
  { mode: 'photos', labelKey: 'viewer.tabPhotos' },
];

interface ViewerControlsProps {
  state: ViewerState;
  /** Dispatch d'une commande (write-side). */
  onCommand: (command: ViewerCommand) => void;
}

export function ViewerControls({ state, onCommand }: ViewerControlsProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
      <div
        role="tablist"
        aria-label={t('viewer.viewLabel')}
        className="flex gap-1 rounded-lg bg-subtle p-1"
      >
        {TABS.map((tab) => {
          const active = state.view === tab.mode;
          return (
            <button
              key={tab.mode}
              role="tab"
              aria-selected={active}
              onClick={() => onCommand(viewerCommands.setView(tab.mode))}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-fg'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {state.view === '3d' && (
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.autoRotate}
              onChange={(e) => onCommand(viewerCommands.setAutoRotate(e.target.checked))}
            />
            {t('viewer.autoRotate')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.wireframe}
              onChange={() => onCommand(viewerCommands.toggleWireframe())}
            />
            {t('viewer.wireframe')}
          </label>
        </div>
      )}
    </div>
  );
}
