import type { TopPost } from './linkedin-export';

/**
 * LinkedIn post URLs encode the hashtags used in the post between the author
 * slug and "-share-", joined by hyphens (e.g. ".../obrenoalvim_websecurity-csrf-share-123").
 * This is the only per-post "topic" signal the export gives us — there's no post text/body.
 */
export function extractHashtags(url: string): string[] {
  const match = url.match(/\/posts\/[^/]*?_(.+)-share-/);
  if (!match) return [];
  return match[1]
    .split('-')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 1 && !/^\d+$/.test(tag));
}

export type TopicStat = {
  tag: string;
  avgEngagement: number;
  engagementCount: number;
  avgImpressions: number;
  impressionCount: number;
};

export function computeTopicStats(byEngagement: TopPost[], byImpressions: TopPost[]): TopicStat[] {
  const map = new Map<
    string,
    { engSum: number; engCount: number; impSum: number; impCount: number }
  >();

  const entry = (tag: string) => {
    let e = map.get(tag);
    if (!e) {
      e = { engSum: 0, engCount: 0, impSum: 0, impCount: 0 };
      map.set(tag, e);
    }
    return e;
  };

  for (const post of byEngagement) {
    for (const tag of extractHashtags(post.url)) {
      const e = entry(tag);
      e.engSum += post.value;
      e.engCount += 1;
    }
  }
  for (const post of byImpressions) {
    for (const tag of extractHashtags(post.url)) {
      const e = entry(tag);
      e.impSum += post.value;
      e.impCount += 1;
    }
  }

  return [...map.entries()].map(([tag, v]) => ({
    tag,
    avgEngagement: v.engCount > 0 ? v.engSum / v.engCount : 0,
    engagementCount: v.engCount,
    avgImpressions: v.impCount > 0 ? v.impSum / v.impCount : 0,
    impressionCount: v.impCount,
  }));
}

export function rankTopics(
  stats: TopicStat[],
  metric: 'avgEngagement' | 'avgImpressions',
  limit = 6,
) {
  const countKey = metric === 'avgEngagement' ? 'engagementCount' : 'impressionCount';
  const withData = stats.filter((s) => s[countKey] > 0);
  const filtered = withData.filter((s) => s[countKey] >= 2);
  const pool = filtered.length >= 3 ? filtered : withData;
  return [...pool].sort((a, b) => b[metric] - a[metric]).slice(0, limit);
}
