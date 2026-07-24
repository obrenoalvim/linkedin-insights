import { Moon, Sun } from 'lucide-react';
import { Button } from './ui';
import { useTheme } from '../hooks/use-theme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Alternar tema">
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
