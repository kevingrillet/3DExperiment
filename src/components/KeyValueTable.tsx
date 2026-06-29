import type { KeyValue } from '../domain/design';

export function KeyValueTable({ title, rows }: { title: string; rows: KeyValue[] }) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-right font-medium text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
