import { useBusinessUnits } from '@/blocks/Dashboard/hooks/useBusinessUnits';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function BusinessUnitDistribution() {
  const { distribution: businessUnitStats, loading } = useBusinessUnits();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold leading-none tracking-tight">
          Business Unit Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading business units...</p>
            </div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
