import { ApiError } from '@/lib/api/types';
import { StaffData } from '../../types';
import { SkillsAnalysisCard } from '../Cards/SkillsAnalysisCard';

// components/Staff/SkillsView.tsx
interface SkillsViewProps {
  skillsData: StaffData | null;
  selectedCategory: 'Technical Skills' | 'Soft Skills';
  onCategoryChange: (category: 'Technical Skills' | 'Soft Skills') => void;
  loading?: boolean;
  error?: ApiError | null;
}

export default function SkillsView({
  skillsData,
  selectedCategory,
  onCategoryChange,
  loading,
  error,
}: SkillsViewProps) {
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
