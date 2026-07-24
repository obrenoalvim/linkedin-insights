import type { DailyPoint, TopPost } from './linkedin-export';

export function computeReachEfficiency(
  totalImpressions: number | null,
  totalFollowers: number | null,
): number | null {
  if (!totalImpressions || !totalFollowers) return null;
  return totalImpressions / totalFollowers;
}

export type Momentum = { recentAvg: number; previousAvg: number; deltaPct: number };

export function computeMomentum(engagement: DailyPoint[], windowDays = 7): Momentum | null {
  if (engagement.length < windowDays * 2) return null;
  const sorted = [...engagement].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const recent = sorted.slice(-windowDays);
  const previous = sorted.slice(-windowDays * 2, -windowDays);
  const avg = (arr: DailyPoint[]) => arr.reduce((s, d) => s + d.impressions, 0) / arr.length;
  const recentAvg = avg(recent);
  const previousAvg = avg(previous);
  const deltaPct = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
  return { recentAvg, previousAvg, deltaPct };
}

export type OverlapPost = { url: string; date: string; engagements: number; impressions: number };

export function computeOverlapPosts(
  byEngagement: TopPost[],
  byImpressions: TopPost[],
): OverlapPost[] {
  const impByUrl = new Map(byImpressions.map((p) => [p.url, p]));
  return byEngagement
    .filter((p) => impByUrl.has(p.url))
    .map((p) => ({
      url: p.url,
      date: p.date,
      engagements: p.value,
      impressions: impByUrl.get(p.url)!.value,
    }));
}

export type PostingGap = { days: number; from: Date; to: Date };

export function computePostingGap(
  byEngagement: TopPost[],
  byImpressions: TopPost[],
): PostingGap | null {
  const dates = [...new Set([...byEngagement, ...byImpressions].map((p) => p.date))]
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length < 2) return null;

  let maxGap = 0;
  let from = dates[0];
  let to = dates[1];
  for (let i = 1; i < dates.length; i++) {
    const gap = (dates[i].getTime() - dates[i - 1].getTime()) / 86_400_000;
    if (gap > maxGap) {
      maxGap = gap;
      from = dates[i - 1];
      to = dates[i];
    }
  }
  return { days: Math.round(maxGap), from, to };
}
