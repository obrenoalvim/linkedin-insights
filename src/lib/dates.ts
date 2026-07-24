/**
 * LinkedIn exports dates as plain D/M/Y-ish text, but which side is day and which is month
 * depends on the account's export locale (US export: "4/25/2026" = M/D/Y; PT-BR export:
 * "24/07/2025" = D/M/Y). We can't trust a fixed format, so we detect it per file: scan every
 * date string and see which position ever exceeds 12 — that side can only be the day.
 */
export type DateOrder = 'DMY' | 'MDY';

const DATE_RE = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/;

export function detectDateOrder(rawDates: string[]): DateOrder {
  let dmyVotes = 0;
  let mdyVotes = 0;
  for (const s of rawDates) {
    const m = s.match(DATE_RE);
    if (!m) continue;
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a > 12) dmyVotes++;
    else if (b > 12) mdyVotes++;
  }
  if (mdyVotes > dmyVotes) return 'MDY';
  return 'DMY';
}

/**
 * Normalizes a raw export date string to an unambiguous local-time ISO string. The `T00:00:00`
 * suffix (no `Z`) matters: a bare "YYYY-MM-DD" is parsed as UTC midnight per spec, which rolls
 * back to the previous day in any negative-UTC-offset timezone (e.g. Brazil) once read locally.
 */
export function toIsoDate(raw: string, order: DateOrder): string {
  const m = raw.match(DATE_RE);
  if (!m) return raw;
  const [, a, b, y] = m;
  const day = order === 'DMY' ? a : b;
  const month = order === 'DMY' ? b : a;
  const year = y.length === 2 ? `20${y}` : y;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`;
}

/** Pulls a trailing date (any separator/order) out of a label like "Total followers on 7/23/2026". */
export function extractTrailingDate(label: string): string | null {
  const m = label.match(/(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})\s*$/);
  return m ? m[1] : null;
}
