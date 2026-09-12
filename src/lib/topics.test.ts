import { describe, expect, it } from 'vitest';
import { extractHashtags, computeTopicStats, rankTopics } from './topics';
import type { TopPost } from './linkedin-export';

describe('extractHashtags', () => {
  it('extracts hyphen-joined tags between the author slug and -share-', () => {
    expect(
      extractHashtags('https://linkedin.com/posts/obrenoalvim_websecurity-csrf-share-123'),
    ).toEqual(['websecurity', 'csrf']);
  });

  it('drops purely numeric segments and single-character segments', () => {
    expect(extractHashtags('https://linkedin.com/posts/user_ai-2026-a-share-1')).toEqual(['ai']);
  });

  it('returns an empty array when the URL does not match the pattern', () => {
    expect(extractHashtags('https://linkedin.com/feed/update/urn:li:activity:1')).toEqual([]);
  });
});

describe('computeTopicStats', () => {
  it('averages engagement and impressions per tag across both lists', () => {
    const byEngagement: TopPost[] = [
      { url: 'https://x/posts/u_ai-share-1', date: '', value: 10 },
      { url: 'https://x/posts/u_ai-share-2', date: '', value: 20 },
    ];
    const byImpressions: TopPost[] = [
      { url: 'https://x/posts/u_ai-share-1', date: '', value: 100 },
    ];

    const stats = computeTopicStats(byEngagement, byImpressions);
    const ai = stats.find((s) => s.tag === 'ai')!;
    expect(ai.avgEngagement).toBe(15);
    expect(ai.engagementCount).toBe(2);
    expect(ai.avgImpressions).toBe(100);
    expect(ai.impressionCount).toBe(1);
  });
});

describe('rankTopics', () => {
  it('prefers tags with at least 2 samples when there are enough of them', () => {
    const stats = [
      {
        tag: 'one-sample',
        avgEngagement: 100,
        engagementCount: 1,
        avgImpressions: 0,
        impressionCount: 0,
      },
      { tag: 'a', avgEngagement: 10, engagementCount: 2, avgImpressions: 0, impressionCount: 0 },
      { tag: 'b', avgEngagement: 9, engagementCount: 2, avgImpressions: 0, impressionCount: 0 },
      { tag: 'c', avgEngagement: 8, engagementCount: 2, avgImpressions: 0, impressionCount: 0 },
    ];
    const ranked = rankTopics(stats, 'avgEngagement');
    expect(ranked.map((r) => r.tag)).toEqual(['a', 'b', 'c']);
  });

  it('falls back to all tags with data when fewer than 3 have enough samples', () => {
    const stats = [
      {
        tag: 'one-sample',
        avgEngagement: 100,
        engagementCount: 1,
        avgImpressions: 0,
        impressionCount: 0,
      },
      {
        tag: 'no-data',
        avgEngagement: 0,
        engagementCount: 0,
        avgImpressions: 0,
        impressionCount: 0,
      },
    ];
    const ranked = rankTopics(stats, 'avgEngagement');
    expect(ranked.map((r) => r.tag)).toEqual(['one-sample']);
  });

  it('respects the limit parameter', () => {
    const stats = Array.from({ length: 10 }, (_, i) => ({
      tag: `t${i}`,
      avgEngagement: i,
      engagementCount: 2,
      avgImpressions: 0,
      impressionCount: 0,
    }));
    expect(rankTopics(stats, 'avgEngagement', 3)).toHaveLength(3);
  });
});
