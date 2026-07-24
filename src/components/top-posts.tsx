import { ExternalLink } from 'lucide-react';
import { ChartCard } from './chart-card';
import { Table } from './ui';
import { formatDateShort, formatNumber } from '../lib/format';
import type { TopPost } from '../lib/linkedin-export';

type Row = { rank: string; date: string; value: string; url: string };

function toRows(posts: TopPost[]): Row[] {
  return posts.map((p, i) => ({
    rank: String(i + 1),
    date: formatDateShort(p.date),
    value: formatNumber(p.value),
    url: p.url,
  }));
}

function PostsTable({
  title,
  description,
  posts,
  metricLabel,
}: {
  title: string;
  description: string;
  posts: TopPost[];
  metricLabel: string;
}) {
  const rows = toRows(posts);
  return (
    <ChartCard title={title} description={description}>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sem dados suficientes neste período.</p>
      ) : (
        <Table
          columns={[
            { key: 'rank', label: '#' },
            { key: 'date', label: 'Publicado em' },
            { key: 'value', label: metricLabel },
          ]}
          rows={rows}
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
      )}
    </ChartCard>
  );
}

export function TopPosts({
  byEngagement,
  byImpressions,
}: {
  byEngagement: TopPost[];
  byImpressions: TopPost[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PostsTable
        title="Top posts por engajamento"
        description="Curtidas, comentários e compartilhamentos"
        posts={byEngagement}
        metricLabel="Engajamentos"
      />
      <PostsTable
        title="Top posts por impressões"
        description="Vezes que apareceram no feed"
        posts={byImpressions}
        metricLabel="Impressões"
      />
    </div>
  );
}
