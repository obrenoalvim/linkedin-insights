import type { DailyPoint, TopPost } from './linkedin-export';

export const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const WEEKDAY_LABELS_LONG = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

function mondayFirstIndex(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return (d.getDay() + 6) % 7; // getDay(): 0=Sun..6=Sat -> 0=Mon..6=Sun
}

export type WeekdayPerformance = {
  day: string;
  dayLong: string;
  totalImpressions: number;
  totalEngagements: number;
  avgImpressions: number;
  engagementRate: number;
  sampleDays: number;
};

export function computeWeekdayPerformance(engagement: DailyPoint[]): WeekdayPerformance[] {
  const buckets = WEEKDAY_LABELS.map((day, i) => ({
    day,
    dayLong: WEEKDAY_LABELS_LONG[i],
    totalImpressions: 0,
    totalEngagements: 0,
    sampleDays: 0,
  }));

  for (const point of engagement) {
    const idx = mondayFirstIndex(point.date);
    if (idx === null) continue;
    buckets[idx].totalImpressions += point.impressions;
    buckets[idx].totalEngagements += point.engagements;
    buckets[idx].sampleDays += 1;
  }

  return buckets.map((b) => ({
    ...b,
    avgImpressions: b.sampleDays > 0 ? b.totalImpressions / b.sampleDays : 0,
    engagementRate: b.totalImpressions > 0 ? (b.totalEngagements / b.totalImpressions) * 100 : 0,
  }));
}

export type WeekdayFrequency = { day: string; dayLong: string; posts: number };

export function computePostingFrequency(postLists: TopPost[][]): WeekdayFrequency[] {
  const seen = new Set<string>();
  const counts = new Array(7).fill(0);

  for (const list of postLists) {
    for (const post of list) {
      if (seen.has(post.url)) continue;
      seen.add(post.url);
      const idx = mondayFirstIndex(post.date);
      if (idx === null) continue;
      counts[idx] += 1;
    }
  }

  return WEEKDAY_LABELS.map((day, i) => ({
    day,
    dayLong: WEEKDAY_LABELS_LONG[i],
    posts: counts[i],
  }));
}

export function bestBy<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T,
  minSample?: { sampleKey: keyof T; min: number },
): T | null {
  let best: T | null = null;
  for (const row of rows) {
    if (minSample && (row[minSample.sampleKey] as number) < minSample.min) continue;
    if (!best || (row[key] as number) > (best[key] as number)) best = row;
  }
  return best;
}
