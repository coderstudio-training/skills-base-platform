// components/Admin/AnalysisView.tsx
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useAdminAnalysis } from '../../hooks/useAdminAnalysis';
import { SkillDistributionItem, SkillGap } from '../../types';
import BaseCard from '../Cards/BaseCard';

const StatusIcon = ({ status }: { status: 'WARNING' | 'CRITICAL' | 'NORMAL' }) => {
  switch (status) {
    case 'CRITICAL':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'WARNING':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'NORMAL':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

const SkillItem = ({ skill }: { skill: SkillDistributionItem }) => (
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

// const TopSkillItem = ({ skill }: { skill: TopSkill }) => (
//   <div className="space-y-2">
//     <div className="flex items-center justify-between">
//       <span className="font-medium text-sm">{skill.name}</span>
//       <span className="text-sm text-muted-foreground">{Math.round(skill.prevalence)}%</span>
//     </div>
//     <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
//       <div
//         className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
//         style={{ width: `${skill.prevalence}%` }}
//       />
//     </div>
//   </div>
// );

const SkillGapItem = ({ skill }: { skill: SkillGap }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-medium text-sm">{skill.name}</span>
      <span
        className={cn(
          'text-xs px-2 py-1 rounded-full',
          skill.gap > 1.5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
        )}
      >
        Gap: {skill.gap.toFixed(1)}
      </span>
    </div>
    <div className="flex flex-col gap-1.5">
      <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(skill.currentAvg / 5) * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-black/50"
          style={{ left: `${(skill.requiredLevel / 5) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current Avg: {skill.currentAvg.toFixed(1)}</span>
        <span>Required: {skill.requiredLevel.toFixed(1)}</span>
      </div>
    </div>
  </div>
);

export default function AnalysisView() {
  const { analysisData, distributionsData, error, loading } = useAdminAnalysis();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BaseCard
        title="Skill Distribution"
        description="Skill coverage across departments"
        loading={loading}
        error={error}
      >
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
          {distributionsData?.skillDistribution.map((businessUnit, buIndex) => (
            <div key={buIndex} className="space-y-4">
              <h2 className="text-lg font-bold text-primary">{businessUnit.businessUnit}</h2>
              {businessUnit.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-2">
                  <h3 className="font-semibold text-base text-muted-foreground">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.skills.map((skill, skillIndex) => (
                      <SkillItem key={skillIndex} skill={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </BaseCard>

      <BaseCard
        title="Grade Distribution"
        description="Employee distribution by grade level"
        loading={loading}
        error={error}
      >
        <div className="space-y-4">
          {distributionsData?.gradeDistribution.map((grade, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{grade.grade}</span>
              <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {grade.userCount} {grade.userCount === 1 ? 'user' : 'users'}
              </span>
            </div>
          ))}
        </div>
      </BaseCard>

      <BaseCard
        title="Top Skills"
        description="Most prevalent skills across the organization"
        loading={loading}
        error={error}
      >
        <div className="space-y-6">
          {analysisData?.capabilities.map((capability, capIndex) => (
            <div key={capIndex} className="space-y-4">
              <h3 className="text-sm font-semibold text-primary">{capability.capability}</h3>
              {/* {capability.topSkills.map((skill, skillIndex) => (
                <TopSkillItem key={skillIndex} skill={skill} />
              ))} */}
            </div>
          ))}
        </div>
      </BaseCard>

      <BaseCard
        title="Skill Gap Analysis"
        description="Areas where skill improvement is needed"
        loading={loading}
        error={error}
      >
        <div className="space-y-6">
          {analysisData?.capabilities.map((capability, capIndex) => (
            <div key={capIndex} className="space-y-4">
              <h3 className="text-sm font-semibold text-primary">{capability.capability}</h3>
              {capability.skillGaps.map((skill, skillIndex) => (
                <SkillGapItem key={skillIndex} skill={skill} />
              ))}
            </div>
          ))}
        </div>
      </BaseCard>
    </div>
  );
}
