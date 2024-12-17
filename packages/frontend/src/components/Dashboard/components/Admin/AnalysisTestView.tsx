import { cn } from '@/lib/utils';
import { BUSINESS_UNITS } from '../../constants';
import { useAdminAnalytics } from '../../hooks/useCacheHook';
import { OrganizationSkillsAnalysis, SkillGap } from '../../types';
import BaseCard from '../Cards/BaseCard';

interface Capability {
  capability: string;
  skillGaps: SkillGap[];
}

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
          style={{ width: `${(skill.currentAvg / 6) * 100}%` }}
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

export default function AnalysisTestView() {
  const analysisData = useAdminAnalytics() as OrganizationSkillsAnalysis;

  // Debug logging
  // useEffect(() => {
  //   console.log('Cache Test - Analysis Data Updated:', {
  //     timestamp: new Date().toISOString(),
  //     dataSnapshot: analysisData
  //   });
  // }, [analysisData]);

  const getBusinessUnitName = (code: string) => {
    if (Object.keys(BUSINESS_UNITS).includes(code)) {
      return BUSINESS_UNITS[code as keyof typeof BUSINESS_UNITS];
    }
    return code;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Analysis Cache Test</h1>
        <p className="text-slate-600">Testing cached data updates - check console for logs</p>
      </div>

      <BaseCard
        title="Skill Gap Analysis (Cached)"
        description="Areas where skill improvement is needed using cached data"
        loading={!analysisData}
      >
        <div className="space-y-6">
          {analysisData?.capabilities?.map((capability: Capability, capIndex: number) => (
            <div key={capIndex} className="space-y-4">
              <h3 className="text-sm font-semibold text-primary">
                {getBusinessUnitName(capability.capability)}
              </h3>
              {capability.skillGaps.map((skill: SkillGap, skillIndex: number) => (
                <SkillGapItem key={skillIndex} skill={skill} />
              ))}
            </div>
          ))}
        </div>
      </BaseCard>

      {/* <BaseCard
        title="Cache Debug Info"
        description="Information about cache updates"
        loading={false}
      >
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Last Update:</strong> {new Date().toLocaleTimeString()}
          </div>
          <div className="text-sm">
            <strong>Cache Duration:</strong> {cacheConfig.defaultRevalidate} seconds
          </div>
          <div className="text-sm text-slate-600">
            Check browser console for detailed update logs
          </div>
        </div>
      </BaseCard> */}
    </div>
  );
}
