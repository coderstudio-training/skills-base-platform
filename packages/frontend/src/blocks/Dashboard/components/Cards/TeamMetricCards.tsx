import { MetricCard } from '@/blocks/Dashboard/components/Cards/MetricCard';
import { TeamMetricCardsProps } from '@/blocks/Dashboard/types';
import { Award, TrendingUp, Users } from 'lucide-react';

export function TeamMetricCards({
  teamSize,
  averagePerformance = 87,
  skillGrowth = 15,
  loading = false,
  error = null,
}: TeamMetricCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard title="Team Size" value={teamSize} loading={loading} error={error} icon={Users} />
      <MetricCard
        title="Average Performance"
        value={averagePerformance}
        loading={loading}
        error={error}
        icon={TrendingUp}
        valueSuffix="%"
      />
      <MetricCard
        title="Skill Growth"
        value={skillGrowth}
        loading={loading}
        error={error}
        icon={Award}
        valuePrefix="+"
        valueSuffix="%"
        subtitle="In the last 6 months"
      />
    </div>
  );
}
