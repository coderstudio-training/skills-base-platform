import { MetricCard } from '@/blocks/Dashboard/components/Cards/MetricCard';
import { AdminMetricCardsProps } from '@/blocks/Dashboard/types';

export function AdminMetricCards({ stats, error }: AdminMetricCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <MetricCard title="Total Employees" value={stats?.totalEmployeesCount ?? 0} error={error} />
      <MetricCard title="Departments" value={stats?.businessUnitsCount ?? 0} error={error} />
      <MetricCard title="Active Employees" value={stats?.activeEmployeesCount ?? 0} error={error} />
    </div>
  );
}
