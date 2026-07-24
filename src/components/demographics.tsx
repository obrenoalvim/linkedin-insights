import { useMemo } from 'react';
import { ChartCard } from './chart-card';
import { BarList } from './bar-list';
import { formatPercent } from '../lib/format';
import type { DemographicRow } from '../lib/linkedin-export';

const CATEGORY_LABELS: Record<string, string> = {
  Company: 'Empresa',
  'Job title': 'Cargo',
  Industry: 'Setor',
  Location: 'Localização',
  Seniority: 'Senioridade',
  'Company size': 'Tamanho da empresa',
};

export function Demographics({ rows }: { rows: DemographicRow[] }) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, DemographicRow[]>();
    for (const row of rows) {
      const list = byCategory.get(row.category) ?? [];
      list.push(row);
      byCategory.set(row.category, list);
    }
    return [...byCategory.entries()].map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) => b.percentage - a.percentage).slice(0, 5),
    }));
  }, [rows]);

  if (groups.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map(({ category, items }) => (
        <ChartCard key={category} title={CATEGORY_LABELS[category] ?? category}>
          <BarList
            items={items.map((item) => ({
              key: item.value,
              label: item.value,
              value: item.percentage,
              displayValue: formatPercent(item.percentage),
            }))}
          />
        </ChartCard>
      ))}
    </div>
  );
}
