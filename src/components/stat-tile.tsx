import type { LucideIcon } from 'lucide-react';
import { Card } from './ui';
import { cn } from '../lib/utils';

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'series-1',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: 'series-1' | 'series-2' | 'series-3' | 'series-4';
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className={cn('absolute -top-6 -right-6 size-24 rounded-full opacity-[0.08]')}
        style={{ background: `var(--${accent})` }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <Icon className="text-muted-foreground size-4" strokeWidth={1.75} />
      </div>
      <p className="text-foreground relative mt-2 font-mono text-3xl font-semibold tabular-nums">
        {value}
      </p>
      {sub && <p className="text-muted-foreground relative mt-1 text-xs">{sub}</p>}
    </Card>
  );
}
