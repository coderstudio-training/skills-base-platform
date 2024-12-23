import { cn } from '@/lib/utils';
import { SkillGap } from '../../types';

export const SkillGapItem = ({ skill }: { skill: SkillGap }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-medium text-sm">{skill.name}</span>
      <span
        className={cn(
          'text-xs px-2 py-1 rounded-md',
          skill.gap < 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white',
        )}
      >
        Gap: {skill.gap.toFixed(1)}
      </span>
    </div>
    <div className="flex flex-col gap-1.5">
      <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(skill.currentAvg / skill.requiredLevel) * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-black/50"
          style={{ left: `${(skill.requiredLevel / 6) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current Avg: {skill.currentAvg.toFixed(1)}</span>
        <span>Required: {skill.requiredLevel.toFixed(1)}</span>
      </div>
    </div>
  </div>
);
