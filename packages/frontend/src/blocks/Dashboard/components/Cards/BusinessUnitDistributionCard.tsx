import { useBusinessUnits } from '@/blocks/Dashboard/hooks/useBusinessUnits';
import { Badge } from '@/components/ui/badge';
import BaseCard from './BaseCard';

export function BusinessUnitDistribution() {
  const { distribution: businessUnitStats } = useBusinessUnits();

  return (
    <BaseCard title="Business Unit Distribution">
      <div className="space-y-2">
        {businessUnitStats.map(bu => (
          <div key={bu.name} className="flex justify-between items-center">
            <span>{bu.name}</span>
            <Badge>{bu.count}</Badge>
          </div>
        ))}
        {businessUnitStats.length === 0 && (
          <div className="text-center text-gray-500 py-4">No business unit data available</div>
        )}
      </div>
    </BaseCard>
  );
}
