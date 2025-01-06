import { SkillsAnalysisCard } from '@/components/Dashboard/components/Cards/SkillsAnalysisCard';
import { StaffSkillsProps } from '@/components/Dashboard/types';

export default function SkillsView({
  skillsData,
  selectedCategory,
  onCategoryChange,
  loading,
  error,
}: StaffSkillsProps) {
  return (
    <div className="space-y-4">
      <SkillsAnalysisCard
        skillsData={skillsData}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        loading={loading}
        error={error}
      />
    </div>
  );
}
