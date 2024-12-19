import { StaffSkillsProps } from '../../types';
import { SkillsAnalysisCard } from '../Cards/SkillsAnalysisCard';

// components/Staff/SkillsView.tsx

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
