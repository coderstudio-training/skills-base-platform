// blocks/Dashboard/components/Cards/StatCard.tsx
import { MetricCardProps } from '@/blocks/Dashboard/types';
import BaseCard from './BaseCard';

export function MetricCard({
  title,
  description,
  value,
  loading = false,
  error = null,
  icon: Icon,
  subtitle,
  valuePrefix = '',
  valueSuffix = '',
}: MetricCardProps) {
  return (
    <BaseCard
      title={title}
      description={description}
      height="auto"
      loading={loading}
      error={error}
      loadingMessage={`Loading ${title.toLowerCase()}...`}
      headerExtra={Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="text-2xl font-bold">
        {valuePrefix}
        {value}
        {valueSuffix}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </BaseCard>
  );
}
