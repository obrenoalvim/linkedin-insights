import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CalendarClock } from 'lucide-react';
import { ChartCard } from './chart-card';
import { chartTooltipContent } from './chart-tooltip';
import { InsightCard } from './insight-card';
import { formatCompact, formatPercent } from '../lib/format';
import {
  computeWeekdayPerformance,
  computePostingFrequency,
  bestBy,
} from '../lib/weekday-insights';
import type { DailyPoint, TopPost } from '../lib/linkedin-export';

export function WeekdayChart({
  engagement,
  topByEngagement,
  topByImpressions,
}: {
  engagement: DailyPoint[];
  topByEngagement: TopPost[];
  topByImpressions: TopPost[];
}) {
  const performance = useMemo(() => computeWeekdayPerformance(engagement), [engagement]);
  const frequency = useMemo(
    () => computePostingFrequency([topByEngagement, topByImpressions]),
    [topByEngagement, topByImpressions],
  );

  const bestDay = useMemo(
    () => bestBy(performance, 'engagementRate', { sampleKey: 'sampleDays', min: 2 }),
    [performance],
  );

  return (
    <div className="space-y-4">
      {bestDay && bestDay.engagementRate > 0 && (
        <InsightCard
          icon={CalendarClock}
          title={`${bestDay.dayLong} é seu melhor dia pra postar`}
          description={`Taxa de engajamento média de ${formatPercent(bestDay.engagementRate, 2)} nesse dia, contra ${formatPercent(overallRate(performance), 2)} na média geral do período.`}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Engajamento por dia da semana"
          description="Engajamentos ÷ impressões, somando todo o período"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performance} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--chart-baseline)' }}
              />
              <YAxis
                tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)' }}
                content={chartTooltipContent({ formatter: (v) => formatPercent(v, 2) })}
              />
              <Bar dataKey="engagementRate" radius={[4, 4, 0, 0]}>
                {performance.map((entry) => (
                  <Cell
                    key={entry.day}
                    fill={entry.day === bestDay?.day ? 'var(--series-2)' : 'var(--series-1)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Frequência de publicação"
          description="Posts em destaque, por dia da semana em que saíram"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={frequency} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--chart-baseline)' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'var(--chart-ink-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)' }}
                content={chartTooltipContent({ formatter: (v) => `${formatCompact(v)} posts` })}
              />
              <Bar dataKey="posts" fill="var(--series-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-muted-foreground text-xs">
        O export do LinkedIn traz só a data de publicação, sem horário — por isso dá pra saber o
        melhor dia da semana, mas não o melhor horário do dia.
      </p>
    </div>
  );
}

function overallRate(performance: ReturnType<typeof computeWeekdayPerformance>) {
  const totalImpressions = performance.reduce((s, p) => s + p.totalImpressions, 0);
  const totalEngagements = performance.reduce((s, p) => s + p.totalEngagements, 0);
  return totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
}
