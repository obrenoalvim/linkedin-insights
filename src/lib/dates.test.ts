import { describe, expect, it } from 'vitest';
import { detectDateOrder, toIsoDate, extractTrailingDate } from './dates';

describe('detectDateOrder', () => {
  it('detects MDY when some first component exceeds 12', () => {
    expect(detectDateOrder(['4/25/2026', '5/1/2026'])).toBe('MDY');
  });

  it('detects DMY when some second component exceeds 12', () => {
    expect(detectDateOrder(['24/07/2025', '01/05/2025'])).toBe('DMY');
  });

  it('defaults to DMY when nothing disambiguates', () => {
    expect(detectDateOrder(['01/02/2025', '03/04/2025'])).toBe('DMY');
  });

  it('ignores strings that are not dates', () => {
    expect(detectDateOrder(['not a date', '25/12/2025'])).toBe('DMY');
  });
});

describe('toIsoDate', () => {
  it('converts a DMY date to ISO with local-time suffix', () => {
    expect(toIsoDate('24/07/2025', 'DMY')).toBe('2025-07-24T00:00:00');
  });

  it('converts an MDY date to ISO with local-time suffix', () => {
    expect(toIsoDate('4/25/2026', 'MDY')).toBe('2026-04-25T00:00:00');
  });

  it('expands two-digit years to 20xx', () => {
    expect(toIsoDate('24/07/25', 'DMY')).toBe('2025-07-24T00:00:00');
  });

  it('returns the raw string unchanged when it does not match the date pattern', () => {
    expect(toIsoDate('not-a-date', 'DMY')).toBe('not-a-date');
  });
});

describe('extractTrailingDate', () => {
  it('pulls a trailing date off a label', () => {
    expect(extractTrailingDate('Total followers on 7/23/2026')).toBe('7/23/2026');
  });

  it('returns null when there is no trailing date', () => {
    expect(extractTrailingDate('Total followers')).toBeNull();
  });
});
