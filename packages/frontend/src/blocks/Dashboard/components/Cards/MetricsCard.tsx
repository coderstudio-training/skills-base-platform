import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  decimals?: number;
}

export function MetricsCard({ icon: Icon, title, value, decimals = 2 }: MetricsCardProps) {
  // Format the value safely
  const formattedValue = typeof value === 'number' ? value.toFixed(decimals) : '0';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm text-muted-foreground">{title}</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{formattedValue}</p>
      </CardContent>
    </Card>
  );
}
