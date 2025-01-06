import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SkillCategoryButtonProps {
  selectedCategory: 'Technical Skills' | 'Soft Skills';
  onCategoryChange: (category: 'Technical Skills' | 'Soft Skills') => void;
}

export default function SkillCategoryButton({
  selectedCategory,
  onCategoryChange,
}: SkillCategoryButtonProps) {
  return (
    <div className="space-x-2">
      <Button
        className={cn(
          'text-white',
          selectedCategory === 'Technical Skills'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
        )}
        size="sm"
        onClick={() => onCategoryChange('Technical Skills')}
      >
        Technical Skills
      </Button>
      <Button
        className={cn(
          'text-white',
          selectedCategory === 'Soft Skills'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
        )}
        size="sm"
        onClick={() => onCategoryChange('Soft Skills')}
      >
        Soft Skills
      </Button>
    </div>
  );
}
