import { ApiError } from '@/lib/api/types';
import BaseCard from './BaseCard';

export type MetricCardProps = {
  title: string;
  value: number;
  loading?: boolean;
  error?: ApiError | null;
};

export function MetricCard({ title, value, loading = false, error = null }: MetricCardProps) {
  return (
    <BaseCard
      title={title}
      height="auto"
      loading={loading}
      error={error}
      loadingMessage={`Loading ${title.toLowerCase()}...`}
    >
      <p className="text-3xl font-bold">{value}</p>
    </BaseCard>
  );
}
