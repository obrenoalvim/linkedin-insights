import { describe, expect, it } from 'vitest';
import { computeWeekdayPerformance, computePostingFrequency, bestBy } from './weekday-insights';
import type { DailyPoint, TopPost } from './linkedin-export';

describe('computeWeekdayPerformance', () => {
  it('buckets impressions/engagements by weekday, Monday first', () => {
    const engagement: DailyPoint[] = [
      // 2025-07-21 is a Monday
      { date: '2025-07-21T00:00:00', impressions: 100, engagements: 10 },
      { date: '2025-07-28T00:00:00', impressions: 200, engagements: 30 },
    ];
    const performance = computeWeekdayPerformance(engagement);
    const monday = performance[0];
    expect(monday.day).toBe('Seg');
    expect(monday.totalImpressions).toBe(300);
    expect(monday.totalEngagements).toBe(40);
    expect(monday.sampleDays).toBe(2);
    expect(monday.avgImpressions).toBe(150);
    expect(monday.engagementRate).toBeCloseTo((40 / 300) * 100);
  });

  it('ignores points with unparseable dates', () => {
    const engagement: DailyPoint[] = [{ date: 'not-a-date', impressions: 100, engagements: 10 }];
    const performance = computeWeekdayPerformance(engagement);
    expect(performance.every((b) => b.sampleDays === 0)).toBe(true);
  });
});

describe('computePostingFrequency', () => {
  it('counts each unique post once even if it appears in multiple lists', () => {
    const post: TopPost = { url: 'https://x/1', date: '2025-07-21T00:00:00', value: 5 };
    const frequency = computePostingFrequency([[post], [post]]);
    expect(frequency[0].posts).toBe(1);
  });

  it('counts posts across weekdays', () => {
    const monday: TopPost = { url: 'https://x/1', date: '2025-07-21T00:00:00', value: 5 };
    const tuesday: TopPost = { url: 'https://x/2', date: '2025-07-22T00:00:00', value: 5 };
    const frequency = computePostingFrequency([[monday, tuesday]]);
    expect(frequency[0].posts).toBe(1);
    expect(frequency[1].posts).toBe(1);
  });
});

describe('bestBy', () => {
  it('returns the row with the highest value for the given key', () => {
    const rows = [{ rate: 1 }, { rate: 5 }, { rate: 3 }];
    expect(bestBy(rows, 'rate')).toEqual({ rate: 5 });
  });

  it('excludes rows below the minimum sample size', () => {
    const rows = [
      { rate: 10, sampleDays: 1 },
      { rate: 5, sampleDays: 3 },
    ];
    expect(bestBy(rows, 'rate', { sampleKey: 'sampleDays', min: 2 })).toEqual({
      rate: 5,
      sampleDays: 3,
    });
  });

  it('returns null for an empty list', () => {
    expect(bestBy([], 'rate')).toBeNull();
  });
});
