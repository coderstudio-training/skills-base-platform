import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';

export default function AdminAnalysisLoading() {
  const { error, loading } = { error: null, loading: true };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BaseCard
        title="Skill Distribution"
        description="Technical skill gaps across business units"
        loading={loading}
        error={error}
      >
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4"></div>
      </BaseCard>

      <BaseCard
        title="Grade Distribution"
        description="Employee distribution by grade level"
        loading={loading}
        error={error}
      >
        <div className="space-y-4"></div>
      </BaseCard>

      <BaseCard
        title="Skill Gap Analysis"
        description="Areas where skill improvement is needed"
        loading={loading}
        error={error}
      >
        <div className="space-y-6"></div>
      </BaseCard>
    </div>
  );
}
