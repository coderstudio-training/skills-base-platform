import { StatusIcon } from '@/components/Dashboard/components/Icons/StatusIcon';
import { SkillDistributionItem } from '@/components/Dashboard/types';

export const SkillItem = ({ skill }: { skill: SkillDistributionItem }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-900">{skill.name}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
        {skill.userCount} {skill.userCount === 1 ? 'user' : 'users'}
      </span>
      <StatusIcon status={skill.status} />
    </div>
  </div>
);
