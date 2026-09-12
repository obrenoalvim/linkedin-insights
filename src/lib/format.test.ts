import { describe, expect, it } from 'vitest';
import { formatNumber, formatCompact, formatPercent, formatDateShort } from './format';

describe('formatNumber', () => {
  it('formats using pt-BR thousands separators', () => {
    expect(formatNumber(12345)).toBe('12.345');
  });

  it('returns an em dash for null/undefined/NaN', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });
});

describe('formatCompact', () => {
  it('formats large numbers compactly', () => {
    expect(formatCompact(12345)).toBe('12,3 mil');
  });

  it('returns an em dash for null/undefined/NaN', () => {
    expect(formatCompact(null)).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats with the given digit precision', () => {
    expect(formatPercent(12.345, 2)).toBe('12.35%');
    expect(formatPercent(12.345)).toBe('12.3%');
  });

  it('returns an em dash for null/undefined/NaN', () => {
    expect(formatPercent(null)).toBe('—');
  });
});

describe('formatDateShort', () => {
  it('formats an ISO date string with local-time suffix', () => {
    expect(formatDateShort('2025-07-24T00:00:00')).toBe('24 de jul.');
  });

  it('accepts a Date instance directly', () => {
    expect(formatDateShort(new Date('2025-07-24T00:00:00'))).toBe('24 de jul.');
  });

  it('falls back to the raw input for an unparseable date', () => {
    expect(formatDateShort('not-a-date')).toBe('not-a-date');
  });
});
