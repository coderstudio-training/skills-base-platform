import { BaseBarChartProps } from '@/blocks/Dashboard/types';
import { Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS } from '../../constants';

export function TeamCompositionBarChart({
  data,
  loading = false,
  xAxisKey,
  series,
  height = 400,
  stacked = true,
  noDataMessage = 'No data available',
  loadingMessage = 'Loading chart data...',
}: BaseBarChartProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-[${height}px]`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[${height}px] text-gray-500`}>
        {noDataMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name}
            stackId={stacked ? 'a' : undefined}
            fill={item.color || COLORS[index % COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
