import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

interface BaseBarChartProps {
  data: Record<string, number | string>[];
  title?: string;
  description?: string;
  loading?: boolean;
  xAxisKey: string;
  series: ChartSeries[];
  height?: number;
  stacked?: boolean;
  noDataMessage?: string;
  loadingMessage?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00ced1'];

export function BaseBarChart({
  data,
  title,
  description,
  loading = false,
  xAxisKey,
  series,
  height = 400,
  stacked = true,
  noDataMessage = 'No data available',
  loadingMessage = 'Loading chart data...',
}: BaseBarChartProps) {
  const renderContent = () => {
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
  };

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle className="font-bold mb-1">{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
