// components/Staff/Buttons/SkillCategoryButton.tsx
import { Button } from '@/components/ui/button';

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
        variant={selectedCategory === 'Technical Skills' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('Technical Skills')}
      >
        Technical Skills
      </Button>
      <Button
        variant={selectedCategory === 'Soft Skills' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('Soft Skills')}
      >
        Soft Skills
      </Button>
    </div>
  );
}
