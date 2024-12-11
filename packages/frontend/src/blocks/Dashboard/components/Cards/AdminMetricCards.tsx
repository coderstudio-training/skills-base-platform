import { AdminMetricCardsProps } from '@/blocks/Dashboard/types';
import { MetricCard } from './MetricCard';

export function AdminMetricCards({ stats, loading, error }: AdminMetricCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Total Employees"
        value={stats?.totalEmployeesCount ?? 0}
        loading={loading}
        error={error}
      />
      <MetricCard
        title="Departments"
        value={stats?.businessUnitsCount ?? 0}
        loading={loading}
        error={error}
      />
      <MetricCard
        title="Active Employees"
        value={stats?.activeEmployeesCount ?? 0}
        loading={loading}
        error={error}
      />
    </div>
  );
}
