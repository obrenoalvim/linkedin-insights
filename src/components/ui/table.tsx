import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Column = { key: string; label: string; sortable?: boolean };

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  pageSize = 10,
  className,
  rowActions,
}: {
  columns: Column[];
  rows: T[];
  pageSize?: number;
  className?: string;
  rowActions?: (row: T) => ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const result = av! > bv! ? 1 : -1;
      return sortDir === 'asc' ? result : -result;
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={cn('w-full', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border border-b">
            {columns.map((col) => (
              <th key={col.key} className="text-muted-foreground p-2 text-left font-medium">
                {col.sortable ? (
                  <button
                    type="button"
                    className="hover:text-foreground flex items-center gap-1"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
            {rowActions && <th />}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr key={i} className="border-border border-b last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="p-2">
                  {row[col.key] as string}
                </td>
              ))}
              {rowActions && <td className="p-2 text-right">{rowActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="border-input rounded-md border px-2 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className="border-input rounded-md border px-2 py-1 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
