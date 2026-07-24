import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import { chartTooltipContent } from './chart-tooltip';
import { formatDateShort, formatNumber, formatPercent } from '../lib/format';
import type { DailyPoint } from '../lib/linkedin-export';

export function EngagementChart({ data }: { data: DailyPoint[] }) {
  const withRate = data.map((d) => ({
    ...d,
    rate: d.impressions > 0 ? (d.engagements / d.impressions) * 100 : 0,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard
        title="Impressões por dia"
        description="Quantas vezes seus posts apareceram no feed"
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={withRate} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
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
              tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={chartTooltipContent({
                formatter: (v) => `${formatNumber(v)} impressões`,
                labelFormatter: formatDateShort,
              })}
            />
            <Area
              type="monotone"
              dataKey="impressions"
              stroke="var(--series-1)"
              strokeWidth={2}
              fill="url(#fillImpressions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Taxa de engajamento por dia" description="Engajamentos ÷ impressões, em %">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={withRate} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
              tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={chartTooltipContent({
                formatter: (v) => formatPercent(v, 2),
                labelFormatter: formatDateShort,
              })}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--series-2)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
