import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skill } from '../../types'; // Update to use the new Skill interface
import { SkillsRadarChart } from '../Charts/RadarChart';

interface SkillsOverviewCardProps {
  skills: Skill[];
  selectedCategory: 'Technical Skills' | 'Soft Skills';
  onCategoryChange: (category: 'Technical Skills' | 'Soft Skills') => void;
}

export function SkillsOverviewCard({
  skills,
  selectedCategory,
  onCategoryChange,
}: SkillsOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Skills Overview</CardTitle>
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
        </div>
        <p className="text-sm text-muted-foreground">
          Your current skill levels compared to required levels
        </p>
      </CardHeader>
      <CardContent>
        <SkillsRadarChart skills={skills} category={selectedCategory} />
      </CardContent>
    </Card>
  );
}
