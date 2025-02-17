import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { SkillGapOverviewProps } from '@/components/Dashboard/types';
import { Progress } from '@/components/ui/progress';

export function SkillGapOverview({ skillGaps, loading, error }: SkillGapOverviewProps) {
  const sortedSkills = skillGaps.sort((a, b) => a.gap - b.gap).slice(0, 3);

  return (
    <BaseCard
      title="Skill Gap Overview"
      loading={loading}
      error={error}
      loadingMessage="Loading skill gaps..."
    >
      <div className="space-y-4">
        {sortedSkills.map(skill => (
          <div key={skill.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{skill.name}</span>
              <span>{skill.gap.toFixed(1)}</span>
            </div>
            <Progress value={(skill.currentAvg / skill.requiredLevel) * 100} className="h-2" />
          </div>
        ))}
        {skillGaps.length === 0 && (
          <div className="text-center text-gray-500 py-4">No skill gaps identified</div>
        )}
      </div>
    </BaseCard>
  );
}
