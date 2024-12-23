import { useAdminAnalysis } from '../../hooks/useAdminAnalysis';
import BaseCard from '../Cards/BaseCard';
import { BusinessUnitSkills } from '../Items/BusinessUnitSkills';
import { CapabilityGaps } from '../Items/CapabilityGaps';
import { GradeItem } from '../Items/GradeItem';

export default function AnalysisView() {
  const { analysisData, distributionsData, error, loading } = useAdminAnalysis();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BaseCard
        title="Skill Distribution"
        description="Technical skill gaps across business units"
        loading={loading}
        error={error}
      >
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
          {distributionsData?.skillDistribution.map((businessUnit, index) => (
            <BusinessUnitSkills key={index} businessUnit={businessUnit} />
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
            <GradeItem key={index} grade={grade} />
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
          {analysisData?.capabilities.map((capability, index) => (
            <CapabilityGaps key={index} capability={capability} />
          ))}
        </div>
      </BaseCard>
    </div>
  );
}
