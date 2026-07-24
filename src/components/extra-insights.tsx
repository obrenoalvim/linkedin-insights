import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Radar,
  Star,
  CalendarX,
  ExternalLink,
} from 'lucide-react';
import { InsightCard } from './insight-card';
import { ChartCard } from './chart-card';
import { Table } from './ui';
import {
  computeReachEfficiency,
  computeMomentum,
  computeOverlapPosts,
  computePostingGap,
} from '../lib/extra-insights';
import { formatDateShort, formatNumber } from '../lib/format';
import type { DailyPoint, TopPost } from '../lib/linkedin-export';

export function ExtraInsights({
  engagement,
  totalImpressions,
  totalFollowers,
  topByEngagement,
  topByImpressions,
}: {
  engagement: DailyPoint[];
  totalImpressions: number | null;
  totalFollowers: number | null;
  topByEngagement: TopPost[];
  topByImpressions: TopPost[];
}) {
  const momentum = useMemo(() => computeMomentum(engagement), [engagement]);
  const reachEfficiency = useMemo(
    () => computeReachEfficiency(totalImpressions, totalFollowers),
    [totalImpressions, totalFollowers],
  );
  const overlapPosts = useMemo(
    () => computeOverlapPosts(topByEngagement, topByImpressions),
    [topByEngagement, topByImpressions],
  );
  const postingGap = useMemo(
    () => computePostingGap(topByEngagement, topByImpressions),
    [topByEngagement, topByImpressions],
  );

  const overlapRows = overlapPosts.map((p) => ({
    date: formatDateShort(p.date),
    engagements: formatNumber(p.engagements),
    impressions: formatNumber(p.impressions),
    url: p.url,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {momentum && (
          <InsightCard
            icon={
              momentum.deltaPct > 2 ? TrendingUp : momentum.deltaPct < -2 ? TrendingDown : Minus
            }
            title={
              momentum.deltaPct > 2
                ? 'Impressões em alta'
                : momentum.deltaPct < -2
                  ? 'Impressões em queda'
                  : 'Impressões estáveis'
            }
            description={`Média dos últimos 7 dias: ${formatNumber(Math.round(momentum.recentAvg))}/dia, contra ${formatNumber(Math.round(momentum.previousAvg))}/dia nos 7 dias anteriores (${momentum.deltaPct >= 0 ? '+' : ''}${momentum.deltaPct.toFixed(0)}%).`}
          />
        )}

        {reachEfficiency !== null && (
          <InsightCard
            icon={Radar}
            title={`${reachEfficiency.toFixed(1)}x impressões por seguidor`}
            description="Cada seguidor equivale, em média, a esse tanto de impressões no período — acima de 1x indica alcance além da sua rede direta."
          />
        )}

        {postingGap && (
          <InsightCard
            icon={CalendarX}
            title={`${postingGap.days} dias no maior intervalo`}
            description={`Maior intervalo entre posts que entraram nos rankings acima, de ${formatDateShort(postingGap.from)} a ${formatDateShort(postingGap.to)}.`}
          />
        )}
      </div>

      {overlapPosts.length > 0 && (
        <ChartCard
          title="Posts na dobradinha"
          description={`${overlapPosts.length} post(s) que aparecem no Top por engajamento E no Top por impressões ao mesmo tempo — seu conteúdo mais completo`}
        >
          <div className="text-muted-foreground flex items-center gap-1.5 pb-3 text-xs">
            <Star className="size-3.5" />
            <span>Ordenados como aparecem no ranking de engajamento</span>
          </div>
          <Table
            columns={[
              { key: 'date', label: 'Publicado em' },
              { key: 'engagements', label: 'Engajamentos' },
              { key: 'impressions', label: 'Impressões' },
            ]}
            rows={overlapRows}
            pageSize={10}
            rowActions={(row) => (
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
              >
                Abrir <ExternalLink className="size-3" />
              </a>
            )}
          />
        </ChartCard>
      )}
    </div>
  );
}
