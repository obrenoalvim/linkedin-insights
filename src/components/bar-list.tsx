export type BarListItem = { key: string; label: string; value: number; displayValue: string };

export function BarList({ items }: { items: BarListItem[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-foreground truncate">{item.label}</span>
            <span className="text-muted-foreground shrink-0 font-mono tabular-nums">
              {item.displayValue}
            </span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.value / max) * 100}%`, background: 'var(--series-1)' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
