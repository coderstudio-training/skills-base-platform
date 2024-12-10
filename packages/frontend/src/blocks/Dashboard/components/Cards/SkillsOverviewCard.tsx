// components/Staff/SkillsOverviewCard.tsx
import { ApiError } from '@/lib/api/types';
import { Skill } from '../../types';
import SkillCategoryButton from '../Buttons/SkillCategoryButton';
import BaseCard from '../Cards/BaseCard';
import { SkillsRadarChart } from '../Charts/RadarChart';

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
