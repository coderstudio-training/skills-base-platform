import { ThemeChangeButtonProps } from '@/components/Dashboard/types';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeChangeButton({
  handleThemeChange,
  preference,
}: ThemeChangeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      className={`dark:hover:bg-slate-600 dark:bg-slate transition-colors duration-200 relative ${
        preference === 'dark'
          ? 'text-gray-500 hover:text-gray-400 dark:hover:text-white'
          : 'hover:text-yellow-400 dark:hover:text-yellow-600'
      }`}
    >
      {preference === 'dark' ? (
        <Moon className="h-5 w-5 animate-scaleIn absolute" />
      ) : (
        <Sun className="h-5 w-5 animate-scaleIn absolute" />
      )}
    </Button>
  );
}
