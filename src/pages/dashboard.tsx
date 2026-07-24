import { useCallback, useMemo, useState } from 'react';
import { Eye, Users, UserPlus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/header';
import { FileDrop } from '../components/file-drop';
import { StatTile } from '../components/stat-tile';
import { EngagementChart } from '../components/engagement-chart';
import { FollowersChart } from '../components/followers-chart';
import { WeekdayChart } from '../components/weekday-chart';
import { ExtraInsights } from '../components/extra-insights';
import { TopPosts } from '../components/top-posts';
import { TopicsChart } from '../components/topics-chart';
import { Demographics } from '../components/demographics';
import { parseLinkedInExport, type LinkedInExport } from '../lib/linkedin-export';
import { formatCompact, formatNumber, formatPercent } from '../lib/format';

export function Dashboard() {
  const [data, setData] = useState<LinkedInExport | null>(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Envie um arquivo .xlsx exportado do LinkedIn.');
      return;
    }
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseLinkedInExport(buffer);
      setData(parsed);
      setFileName(file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível ler esse arquivo.');
    } finally {
      setBusy(false);
    }
  }, []);

  const totals = useMemo(() => {
    if (!data) return null;
    const totalEngagements = data.engagement.reduce((s, d) => s + d.engagements, 0);
    const totalImpressions =
      data.impressions ?? data.engagement.reduce((s, d) => s + d.impressions, 0);
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
    const newFollowers = data.followers.reduce((s, d) => s + d.newFollowers, 0);
    return { totalEngagements, totalImpressions, engagementRate, newFollowers };
  }, [data]);

  return (
    <div className="min-h-screen">
      <Header hasData={!!data} onReset={() => setData(null)} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!data ? (
          <div className="mx-auto max-w-2xl py-10">
            <FileDrop onFile={handleFile} busy={busy} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h1 className="font-display text-foreground text-2xl font-semibold">
                  Visão geral do período
                </h1>
                {data.rangeLabel && (
                  <p className="text-muted-foreground text-sm">{data.rangeLabel}</p>
                )}
              </div>
              {fileName && <p className="text-muted-foreground font-mono text-xs">{fileName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                label="Impressões"
                value={formatCompact(totals?.totalImpressions)}
                sub={`${formatNumber(totals?.totalImpressions)} no total`}
                icon={Eye}
                accent="series-1"
              />
              <StatTile
                label="Alcance"
                value={formatCompact(data.membersReached)}
                sub="pessoas alcançadas"
                icon={Users}
                accent="series-2"
              />
              <StatTile
                label="Seguidores"
                value={formatCompact(data.totalFollowers)}
                sub={totals ? `+${formatNumber(totals.newFollowers)} no período` : undefined}
                icon={UserPlus}
                accent="series-3"
              />
              <StatTile
                label="Taxa de engajamento"
                value={formatPercent(totals?.engagementRate, 2)}
                sub={`${formatNumber(totals?.totalEngagements)} engajamentos`}
                icon={TrendingUp}
                accent="series-4"
              />
            </div>

            <section className="space-y-4">
              <h2 className="font-display text-foreground text-lg font-medium">Outros insights</h2>
              <ExtraInsights
                engagement={data.engagement}
                totalImpressions={totals?.totalImpressions ?? null}
                totalFollowers={data.totalFollowers}
                topByEngagement={data.topByEngagement}
                topByImpressions={data.topByImpressions}
              />
            </section>

            <section className="space-y-4">
              <EngagementChart data={data.engagement} />
            </section>

            <section className="space-y-4">
              <FollowersChart data={data.followers} totalFollowers={data.totalFollowers} />
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-foreground text-lg font-medium">Quando postar</h2>
              <WeekdayChart
                engagement={data.engagement}
                topByEngagement={data.topByEngagement}
                topByImpressions={data.topByImpressions}
              />
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-foreground text-lg font-medium">
                Posts em destaque
              </h2>
              <TopPosts byEngagement={data.topByEngagement} byImpressions={data.topByImpressions} />
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-foreground text-lg font-medium">
                Temas que mais performam
              </h2>
              <TopicsChart
                byEngagement={data.topByEngagement}
                byImpressions={data.topByImpressions}
              />
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-foreground text-lg font-medium">
                Demografia da audiência
              </h2>
              <Demographics rows={data.demographics} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
