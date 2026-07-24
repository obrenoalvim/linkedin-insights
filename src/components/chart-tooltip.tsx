import type { TooltipContentProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

export function chartTooltipContent(opts: {
  formatter?: (v: number) => string;
  labelFormatter?: (label: string) => string;
}) {
  return function Content({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
    if (!active || !payload?.length) return null;
    return (
      <div className="border-border bg-popover rounded-lg border px-3 py-2 text-xs shadow-md">
        <p className="text-muted-foreground mb-1 font-medium">
          {opts.labelFormatter && label !== undefined ? opts.labelFormatter(String(label)) : label}
        </p>
        {payload.map((p) => (
          <p
            key={String(p.dataKey)}
            className="text-popover-foreground flex items-center gap-2 font-mono tabular-nums"
          >
            <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
            {opts.formatter && typeof p.value === 'number' ? opts.formatter(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };
}
