import { useCallback, useRef, useState, type DragEvent } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui';

export function FileDrop({ onFile, busy }: { onFile: (file: File) => void; busy?: boolean }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-20 text-center transition-colors',
        dragOver ? 'border-primary bg-primary/5' : 'border-border bg-card',
      )}
    >
      <div
        className={cn(
          'flex size-16 items-center justify-center rounded-full transition-transform',
          dragOver ? 'bg-primary/15 scale-110' : 'bg-secondary',
        )}
      >
        {busy ? (
          <FileSpreadsheet className="text-primary size-7 animate-pulse" />
        ) : (
          <UploadCloud className="text-primary size-7" />
        )}
      </div>

      <div className="space-y-1.5">
        <p className="font-display text-foreground text-xl font-medium">
          {busy ? 'Lendo sua planilha…' : 'Solte o export do LinkedIn aqui'}
        </p>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          Arquivo <span className="font-mono">AggregateAnalytics_*.xlsx</span>, baixado em{' '}
          <em>Seu perfil → Analytics de conteúdo → Exportar</em>. Tudo é processado no seu
          navegador, nada sai da sua máquina.
        </p>
      </div>

      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        Selecionar arquivo
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
