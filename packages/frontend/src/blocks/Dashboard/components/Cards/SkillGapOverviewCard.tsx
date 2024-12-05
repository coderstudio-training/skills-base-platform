import { useSkillGaps } from '@/blocks/Dashboard/hooks/useSkillGaps';
import { Progress } from '@/components/ui/progress';
import BaseCard from './BaseCard';

export function SkillGapOverview() {
  const { skillGaps, loading } = useSkillGaps();

  return (
    <BaseCard title="Skill Gap Overview" loading={loading} loadingMessage="Loading skill gaps...">
      <div className="space-y-4">
        {skillGaps.map(skill => (
          <div key={skill.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{skill.name}</span>
              <span>{skill.gap.toFixed(1)}</span>
            </div>
            <Progress value={(skill.currentLevel / skill.requiredLevel) * 100} className="h-2" />
          </div>
        ))}
        {skillGaps.length === 0 && (
          <div className="text-center text-gray-500 py-4">No skill gaps identified</div>
        )}
      </div>
    </BaseCard>
  );
}
