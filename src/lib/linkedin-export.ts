import * as XLSX from 'xlsx';
import { z } from 'zod';
import { detectDateOrder, toIsoDate, extractTrailingDate, type DateOrder } from './dates';

export type DailyPoint = { date: string; impressions: number; engagements: number };
export type FollowerPoint = { date: string; newFollowers: number };
export type TopPost = { url: string; date: string; value: number };
export type DemographicRow = { category: string; value: string; percentage: number };

export type LinkedInExport = {
  rangeLabel: string | null;
  impressions: number | null;
  membersReached: number | null;
  totalFollowers: number | null;
  totalFollowersAsOf: string | null;
  engagement: DailyPoint[];
  followers: FollowerPoint[];
  topByEngagement: TopPost[];
  topByImpressions: TopPost[];
  demographics: DemographicRow[];
};

const numeric = z.union([z.number(), z.string()]).transform((v) => {
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,.](?=\d{3}\b)/g, ''));
  return Number.isFinite(n) ? n : 0;
});

/**
 * LinkedIn's analytics export uses one fixed layout (sheet order + row/column shape) across
 * every locale it ships translated strings for — only the labels change, never the structure.
 * So instead of matching sheet/row names in English, we read by position and only fall back to
 * light regex for the two genuinely language-variant bits: dates (see lib/dates.ts) and
 * percentages ("< 1%" vs "menos de 1%" vs "moins de 1 %"...).
 */
function sheetRowsAt(wb: XLSX.WorkBook, index: number): unknown[][] {
  const name = wb.SheetNames[index];
  const sheet = name ? wb.Sheets[name] : undefined;
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: true });
}

function parsePercentage(raw: unknown): number {
  const match = String(raw ?? '').match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;
  return Number(match[1].replace(',', '.')) || 0;
}

function parseDiscovery(wb: XLSX.WorkBook) {
  const rows = sheetRowsAt(wb, 0);
  return {
    rangeLabel: rows[0]?.[1] != null ? String(rows[0][1]) : null,
    impressions: rows[1]?.[1] != null ? numeric.parse(rows[1][1]) : null,
    membersReached: rows[2]?.[1] != null ? numeric.parse(rows[2][1]) : null,
  };
}

function parseEngagement(wb: XLSX.WorkBook, order: DateOrder): DailyPoint[] {
  return sheetRowsAt(wb, 1)
    .slice(1)
    .filter((r) => r[0])
    .map((r) => ({
      date: toIsoDate(String(r[0]), order),
      impressions: numeric.parse(r[1] ?? 0),
      engagements: numeric.parse(r[2] ?? 0),
    }));
}

function parseFollowers(wb: XLSX.WorkBook, order: DateOrder) {
  const rows = sheetRowsAt(wb, 3);
  const totalRow = rows[0];
  const totalFollowers = totalRow?.[1] != null ? numeric.parse(totalRow[1]) : null;
  const asOfRaw = totalRow?.[0] != null ? extractTrailingDate(String(totalRow[0])) : null;
  const totalFollowersAsOf = asOfRaw ? toIsoDate(asOfRaw, order) : null;

  const points: FollowerPoint[] = rows
    .slice(3)
    .filter((r) => r[0])
    .map((r) => ({ date: toIsoDate(String(r[0]), order), newFollowers: numeric.parse(r[1] ?? 0) }));

  return { totalFollowers, totalFollowersAsOf, points };
}

function parseTopPosts(wb: XLSX.WorkBook, order: DateOrder) {
  const byEngagement: TopPost[] = [];
  const byImpressions: TopPost[] = [];

  for (const r of sheetRowsAt(wb, 2).slice(3)) {
    const [leftUrl, leftDate, leftVal, , rightUrl, rightDate, rightVal] = r as unknown[];
    if (leftUrl) {
      byEngagement.push({
        url: String(leftUrl),
        date: leftDate ? toIsoDate(String(leftDate), order) : '',
        value: numeric.parse(leftVal ?? 0),
      });
    }
    if (rightUrl) {
      byImpressions.push({
        url: String(rightUrl),
        date: rightDate ? toIsoDate(String(rightDate), order) : '',
        value: numeric.parse(rightVal ?? 0),
      });
    }
  }
  return { byEngagement, byImpressions };
}

function parseDemographics(wb: XLSX.WorkBook): DemographicRow[] {
  const out: DemographicRow[] = [];
  for (const r of sheetRowsAt(wb, 4).slice(1)) {
    const [category, value, pct] = r as [unknown, unknown, unknown];
    if (!category || !value) continue;
    out.push({
      category: String(category),
      value: String(value),
      percentage: parsePercentage(pct),
    });
  }
  return out;
}

export function parseLinkedInExport(buffer: ArrayBuffer): LinkedInExport {
  const wb = XLSX.read(buffer, { type: 'array' });

  if (wb.SheetNames.length < 5) {
    throw new Error(
      'Arquivo não reconhecido como export de analytics do LinkedIn (esperado 5 abas: Discovery, Engagement, Top Posts, Followers, Demographics).',
    );
  }

  const rawDates = [
    ...sheetRowsAt(wb, 1)
      .slice(1)
      .map((r) => r[0]),
    ...sheetRowsAt(wb, 3)
      .slice(3)
      .map((r) => r[0]),
  ].filter((d): d is string => typeof d === 'string');
  const order = detectDateOrder(rawDates);

  const discovery = parseDiscovery(wb);
  const followers = parseFollowers(wb, order);
  const topPosts = parseTopPosts(wb, order);

  return {
    rangeLabel: discovery.rangeLabel,
    impressions: discovery.impressions,
    membersReached: discovery.membersReached,
    totalFollowers: followers.totalFollowers,
    totalFollowersAsOf: followers.totalFollowersAsOf,
    engagement: parseEngagement(wb, order),
    followers: followers.points,
    topByEngagement: topPosts.byEngagement,
    topByImpressions: topPosts.byImpressions,
    demographics: parseDemographics(wb),
  };
}
