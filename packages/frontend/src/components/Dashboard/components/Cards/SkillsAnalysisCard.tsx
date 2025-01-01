import SkillCategoryButton from '@/components/Dashboard/components/Buttons/SkillCategoryButton';
import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { MetricCard } from '@/components/Dashboard/components/Cards/MetricCard';
import { SkillsGapChart } from '@/components/Dashboard/components/Charts/SkillsBarChart';
import { SkillsTable } from '@/components/Dashboard/components/Tables/SkillsTable';
import { StaffSkillsProps } from '@/components/Dashboard/types';
import { ArrowDownUp, CheckCircle2, Scale, XCircle } from 'lucide-react';

export function SkillsAnalysisCard({
  skillsData,
  selectedCategory,
  onCategoryChange,
  loading,
  error,
}: StaffSkillsProps) {
  const categoryMetrics =
    selectedCategory === 'Technical Skills'
      ? skillsData?.metrics?.technicalSkills
      : skillsData?.metrics?.softSkills;

  const safeMetrics = {
    averageGap: categoryMetrics?.averageGap ?? 0,
    skillsMeetingRequired: categoryMetrics?.skillsMeetingRequired ?? 0,
    skillsNeedingImprovement: categoryMetrics?.skillsNeedingImprovement ?? 0,
    largestGap: categoryMetrics?.largestGap ?? 0,
  };

  return (
    <BaseCard
      title="Skill Gaps Analysis"
      loading={loading}
      error={error}
      headerExtra={
        <SkillCategoryButton
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      }
    >
      <div className="h-[450px] w-full">
        <SkillsGapChart skills={skillsData?.skills ?? []} category={selectedCategory} />
      </div>

      <div>
        <h4 className="text-md font-semibold mb-2">Detailed Gap Analysis</h4>
        <p className="text-sm text-gray-600 mb-4">
          Breakdown of your {selectedCategory.toLowerCase()}
        </p>
        <SkillsTable skills={skillsData?.skills ?? []} category={selectedCategory} />
      </div>

      <div className="mt-8">
        <h4 className="text-md font-semibold mb-2">{selectedCategory} Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Average Gap"
            value={safeMetrics.averageGap}
            loading={loading}
            error={error}
            icon={Scale}
          />
          <MetricCard
            title="Skills Meeting Required"
            value={safeMetrics.skillsMeetingRequired}
            loading={loading}
            error={error}
            icon={CheckCircle2}
          />
          <MetricCard
            title="Skills Needing Improvement"
            value={safeMetrics.skillsNeedingImprovement}
            loading={loading}
            error={error}
            icon={XCircle}
          />
          <MetricCard
            title="Largest Gap"
            value={safeMetrics.largestGap}
            loading={loading}
            error={error}
            icon={ArrowDownUp}
          />
        </div>
      </div>
    </BaseCard>
  );
}
