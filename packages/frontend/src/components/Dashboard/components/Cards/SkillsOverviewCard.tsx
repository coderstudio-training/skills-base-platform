import SkillCategoryButton from '@/components/Dashboard/components/Buttons/SkillCategoryButton';
import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { SkillsRadarChart } from '@/components/Dashboard/components/Charts/RadarChart';
import { Skill } from '@/components/Dashboard/types';
import { ApiError } from '@/lib/api/types';

interface SkillsOverviewCardProps {
  skills: Skill[];
  selectedCategory: 'Technical Skills' | 'Soft Skills';
  onCategoryChange: (category: 'Technical Skills' | 'Soft Skills') => void;
  loading?: boolean;
  error?: ApiError | null;
}

export function SkillsOverviewCard({
  skills,
  selectedCategory,
  onCategoryChange,
  loading,
  error,
}: SkillsOverviewCardProps) {
  return (
    <BaseCard
      title="Skills Overview"
      description="Your current skill levels compared to required levels"
      loading={loading}
      error={error}
      headerExtra={
        <SkillCategoryButton
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      }
    >
      <SkillsRadarChart skills={skills} category={selectedCategory} />
    </BaseCard>
  );
}
