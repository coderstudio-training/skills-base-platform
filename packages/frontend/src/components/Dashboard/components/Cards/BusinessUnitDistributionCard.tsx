import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { BusinessUnitDistributionProps } from '@/components/Dashboard/types';
import { Badge } from '@/components/ui/badge';

export function BusinessUnitDistribution({
  businessUnits,
  loading,
  error,
}: BusinessUnitDistributionProps) {
  return (
    <BaseCard
      title="Business Unit Distribution"
      loading={loading}
      error={error}
      loadingMessage="Loading business units..."
    >
      <div className="space-y-2">
        {businessUnits.map(bu => (
          <div key={bu.name} className="flex justify-between items-center">
            <span>{bu.name}</span>
            <Badge>{bu.count}</Badge>
          </div>
        ))}
        {businessUnits.length === 0 && (
          <div className="text-center text-gray-500 py-4">No business unit data available</div>
        )}
      </div>
    </BaseCard>
  );
}
