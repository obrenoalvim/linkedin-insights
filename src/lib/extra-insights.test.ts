import { describe, expect, it } from 'vitest';
import {
  computeReachEfficiency,
  computeMomentum,
  computeOverlapPosts,
  computePostingGap,
} from './extra-insights';
import type { DailyPoint, TopPost } from './linkedin-export';

describe('computeReachEfficiency', () => {
  it('divides impressions by followers', () => {
    expect(computeReachEfficiency(1000, 500)).toBe(2);
  });

  it('returns null when either input is missing or zero', () => {
    expect(computeReachEfficiency(null, 500)).toBeNull();
    expect(computeReachEfficiency(1000, null)).toBeNull();
    expect(computeReachEfficiency(1000, 0)).toBeNull();
  });
});

describe('computeMomentum', () => {
  function daysOfImpressions(count: number, impressions: (i: number) => number): DailyPoint[] {
    return Array.from({ length: count }, (_, i) => ({
      date: new Date(2025, 0, i + 1).toISOString(),
      impressions: impressions(i),
      engagements: 0,
    }));
  }

  it('returns null when there are fewer than 2 windows of data', () => {
    expect(computeMomentum(daysOfImpressions(10, () => 1))).toBeNull();
  });

  it('compares the last window against the previous window', () => {
    // first 7 days at 100 impressions, last 7 days at 200
    const points = [...daysOfImpressions(7, () => 100), ...daysOfImpressions(7, () => 200)].map(
      (p, i) => ({ ...p, date: new Date(2025, 0, i + 1).toISOString() }),
    );
    const momentum = computeMomentum(points)!;
    expect(momentum.previousAvg).toBe(100);
    expect(momentum.recentAvg).toBe(200);
    expect(momentum.deltaPct).toBe(100);
  });
});

describe('computeOverlapPosts', () => {
  it('returns only posts present in both lists, keyed by url', () => {
    const byEngagement: TopPost[] = [
      { url: 'a', date: '2025-01-01', value: 10 },
      { url: 'b', date: '2025-01-02', value: 20 },
    ];
    const byImpressions: TopPost[] = [{ url: 'a', date: '2025-01-01', value: 500 }];
    const overlap = computeOverlapPosts(byEngagement, byImpressions);
    expect(overlap).toEqual([{ url: 'a', date: '2025-01-01', engagements: 10, impressions: 500 }]);
  });
});

describe('computePostingGap', () => {
  it('finds the largest gap in days across deduplicated dates from both lists', () => {
    const byEngagement: TopPost[] = [
      { url: 'a', date: '2025-01-01T00:00:00', value: 1 },
      { url: 'b', date: '2025-01-03T00:00:00', value: 1 },
    ];
    const byImpressions: TopPost[] = [{ url: 'c', date: '2025-01-10T00:00:00', value: 1 }];
    const gap = computePostingGap(byEngagement, byImpressions)!;
    expect(gap.days).toBe(7);
  });

  it('returns null with fewer than 2 valid dates', () => {
    expect(computePostingGap([], [])).toBeNull();
  });
});
