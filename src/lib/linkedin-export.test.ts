import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseLinkedInExport } from './linkedin-export';

function buildWorkbook(sheets: unknown[][][]) {
  const wb = XLSX.utils.book_new();
  const names = ['Discovery', 'Engagement', 'Top posts', 'Followers', 'Demographics'];
  sheets.forEach((rows, i) => {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), names[i]);
  });
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return out;
}

function fullExportBuffer() {
  const discovery = [
    ['Discovery', 'Value'],
    ['Impressions', 5000],
    ['Members reached', 1200],
  ];
  const engagement = [
    ['Date', 'Impressions', 'Engagements'],
    ['24/07/2025', 100, 10],
    ['25/07/2025', 200, 30],
  ];
  const topPosts = [
    ['Top posts by engagement'],
    [],
    ['Post URL', 'Date', 'Engagements', '', 'Post URL', 'Date', 'Impressions'],
    [
      'https://linkedin.com/posts/user_ai-share-1',
      '24/07/2025',
      15,
      '',
      'https://linkedin.com/posts/user_ai-share-1',
      '24/07/2025',
      900,
    ],
  ];
  const followers = [
    ['Total followers on 26/07/2025', 5000],
    [],
    ['Date', 'New followers'],
    ['24/07/2025', 3],
    ['25/07/2025', 7],
  ];
  const demographics = [
    ['Category', 'Value', 'Percentage'],
    ['Industry', 'Software', '< 1%'],
    ['Industry', 'Finance', '25%'],
  ];
  return buildWorkbook([discovery, engagement, topPosts, followers, demographics]);
}

describe('parseLinkedInExport', () => {
  it('parses all sections of a well-formed export', () => {
    const result = parseLinkedInExport(fullExportBuffer());

    expect(result.impressions).toBe(5000);
    expect(result.membersReached).toBe(1200);
    expect(result.totalFollowers).toBe(5000);
    expect(result.totalFollowersAsOf).toBe('2025-07-26T00:00:00');

    expect(result.engagement).toEqual([
      { date: '2025-07-24T00:00:00', impressions: 100, engagements: 10 },
      { date: '2025-07-25T00:00:00', impressions: 200, engagements: 30 },
    ]);

    expect(result.followers).toEqual([
      { date: '2025-07-24T00:00:00', newFollowers: 3 },
      { date: '2025-07-25T00:00:00', newFollowers: 7 },
    ]);

    expect(result.topByEngagement).toEqual([
      { url: 'https://linkedin.com/posts/user_ai-share-1', date: '2025-07-24T00:00:00', value: 15 },
    ]);
    expect(result.topByImpressions).toEqual([
      {
        url: 'https://linkedin.com/posts/user_ai-share-1',
        date: '2025-07-24T00:00:00',
        value: 900,
      },
    ]);

    expect(result.demographics).toEqual([
      { category: 'Industry', value: 'Software', percentage: 1 },
      { category: 'Industry', value: 'Finance', percentage: 25 },
    ]);
  });

  it('detects MDY order for US-style exports', () => {
    const engagement = [
      ['Date', 'Impressions', 'Engagements'],
      ['4/25/2026', 100, 10],
    ];
    const buf = buildWorkbook([
      [['Discovery'], ['Impressions', 1], ['Members reached', 1]],
      engagement,
      [['Top posts'], [], ['h']],
      [['Total followers', 1], [], ['h']],
      [['h']],
    ]);
    const result = parseLinkedInExport(buf);
    expect(result.engagement[0].date).toBe('2026-04-25T00:00:00');
  });

  it('throws for a file with fewer than 5 sheets', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['a']]), 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    expect(() => parseLinkedInExport(buf)).toThrow(/5 abas/);
  });
});
