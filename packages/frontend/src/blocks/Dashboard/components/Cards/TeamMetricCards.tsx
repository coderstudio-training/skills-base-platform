import { ApiError } from '@/lib/api/types';
import { MetricCard } from './MetricCard';

interface TeamMetricCardProps {
  teamSize: number;
  averagePerformance?: number;
  skillGrowth?: number;
  loading?: boolean;
  error?: ApiError | null;
}

export function TeamMetricCards({
  teamSize,
  averagePerformance = 97,
  skillGrowth = 25,
  loading = false,
  error = null,
}: TeamMetricCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard title="Total Team Members" value={teamSize} loading={loading} error={error} />
      <MetricCard
        title="Average Performance"
        value={averagePerformance}
        loading={loading}
        error={error}
      />
      <MetricCard title="Skill Growth" value={skillGrowth} loading={loading} error={error} />
    </div>
  );
}
