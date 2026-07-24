import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import { chartTooltipContent } from './chart-tooltip';
import { formatDateShort, formatNumber } from '../lib/format';
import type { FollowerPoint } from '../lib/linkedin-export';

export function FollowersChart({
  data,
  totalFollowers,
}: {
  data: FollowerPoint[];
  totalFollowers: number | null;
}) {
  const cumulative = useMemo(() => {
    const totalNew = data.reduce((sum, d) => sum + d.newFollowers, 0);
    const baseline = totalFollowers !== null ? totalFollowers - totalNew : 0;
    let running = baseline;
    return data.map((d) => {
      running += d.newFollowers;
      return { date: d.date, total: running, newFollowers: d.newFollowers };
    });
  }, [data, totalFollowers]);

  return (
    <ChartCard
      title="Crescimento de seguidores"
      description="Total acumulado de seguidores ao longo do período"
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={cumulative} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillFollowers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-3)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--series-3)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-baseline)' }}
            minTickGap={32}
          />
          <YAxis
            domain={['dataMin - 5', 'dataMax + 5']}
            tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={chartTooltipContent({
              formatter: (v) => `${formatNumber(v)} seguidores`,
              labelFormatter: formatDateShort,
            })}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--series-3)"
            strokeWidth={2}
            fill="url(#fillFollowers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
