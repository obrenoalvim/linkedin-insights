import { Radio } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui';

export function Header({ onReset, hasData }: { onReset?: () => void; hasData: boolean }) {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
            <Radio className="text-primary size-4" strokeWidth={2} />
          </span>
          <div>
            <p className="font-display text-foreground text-lg leading-none font-semibold">Sinal</p>
            <p className="text-muted-foreground text-[11px] leading-none">Insights do LinkedIn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasData && (
            <Button variant="outline" size="sm" onClick={onReset}>
              Trocar arquivo
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
