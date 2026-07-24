import type { LucideIcon } from 'lucide-react';
import { Card } from './ui';

export function InsightCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-full">
        <Icon className="text-primary size-5" />
      </span>
      <div>
        <p className="font-display text-foreground text-lg font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Card>
  );
}
