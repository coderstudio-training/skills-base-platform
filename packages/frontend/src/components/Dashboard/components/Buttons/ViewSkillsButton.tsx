import { ViewSkillsButtonProps } from '@/components/Dashboard/types';
import { Button } from '@/components/ui/button';

export function ViewSkillsButton({ onClick }: ViewSkillsButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      View Skills
    </Button>
  );
}
