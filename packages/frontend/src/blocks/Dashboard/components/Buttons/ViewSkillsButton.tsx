import { ViewSkillsButtonProps } from '@/blocks/Dashboard/types';
import { Button } from '@/components/ui/button';

export function ViewSkillsButton({ onClick }: ViewSkillsButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      View Skills
    </Button>
  );
}
