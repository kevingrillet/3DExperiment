import { useEffect, useState } from 'react';
import { tokenizeScadLines, type ScadTokenType } from '../lib/scadHighlight';
import { useI18n } from '../i18n/I18nProvider';
import { Spinner } from './Spinner';

/** Classe Tailwind de couleur par type de jeton (tokens définis dans index.css). */
const TOKEN_CLASS: Record<ScadTokenType, string> = {
  comment: 'text-scad-comment italic',
  string: 'text-scad-string',
  number: 'text-scad-number',
  keyword: 'text-scad-keyword',
  builtin: 'text-scad-builtin',
  special: 'text-scad-special',
  function: 'text-scad-function',
  punct: 'text-scad-punct',
  plain: '',
};

interface FetchState {
  code?: string;
  loading: boolean;
  error?: Error;
}

/** Affiche une source OpenSCAD (`.scad`) colorée, avec numéros de ligne et copie. */
export function SourceViewer({ url, filename = 'model.scad' }: { url: string; filename?: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<FetchState>({ loading: true });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    // Reset volontaire en « chargement » à chaque changement d'url (refetch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ loading: true });
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((code) => active && setState({ loading: false, code }))
      .catch((error: unknown) => {
        if (active) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  if (state.loading) return <Spinner label={t('viewer.loadingSource')} />;
  if (state.error || state.code === undefined) {
    return (
      <div className="flex h-full min-h-[20rem] items-center justify-center rounded-lg border border-dashed border-line text-faint">
        {t('viewer.sourceError')}
      </div>
    );
  }

  const lines = tokenizeScadLines(state.code);

  async function copy() {
    try {
      await navigator.clipboard.writeText(state.code ?? '');
      setCopied(true);
    } catch {
      /* presse-papier indisponible : on ignore. */
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-subtle px-3 py-2">
        <span className="font-mono text-xs text-muted">{filename}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg transition hover:bg-subtle"
        >
          {copied ? t('viewer.copied') : t('viewer.copy')}
        </button>
      </div>
      <div className="max-h-[28rem] overflow-auto">
        <pre className="w-max min-w-full font-mono text-[13px] leading-relaxed">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="sticky left-0 select-none border-r border-line bg-code px-3 text-right text-scad-gutter tabular-nums">
                  {i + 1}
                </span>
                <span className="px-4 whitespace-pre text-scad-fg">
                  {line.map((tok, j) => (
                    <span key={j} className={TOKEN_CLASS[tok.type]}>
                      {tok.value}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
