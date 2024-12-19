import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SkillData {
  skill: string;
  average: number;
  requiredRating: number;
  gap: number;
  [key: string]: string | number;
}

type StaticColor = { type: 'static'; value: string };
type DynamicColor = {
  type: 'dynamic';
  getValue: (data: SkillData) => string;
};
type ColorConfig = StaticColor | DynamicColor;

interface SeriesConfig {
  name: string;
  key: string;
  color: ColorConfig;
}

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: SkillData[];
  xAxisKey: string;
  yAxisDomain?: [number, number];
  yAxisTicks?: number[];
  series: SeriesConfig[];
  height?: number;
}

const CustomXAxisTick = ({
  x,
  y,
  payload,
}: {
  x: number;
  y: number;
  payload: { value: string };
}) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={16}
      textAnchor="end"
      fill="#666"
      transform="rotate(-45)"
      style={{ fontSize: '11px' }}
    >
      {payload.value}
    </text>
  </g>
);

interface TooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: SkillData;
  }[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload?.length) {
    const data = payload[0].payload as SkillData;

    return (
      <div className="bg-white p-4 rounded-lg space-y-1 shadow-lg border">
        <p className="font-semibold mb-2">{data.skill}</p>
        <p className="text-blue-600">Current Level: {data.average.toFixed(1)}</p>
        <p className="text-gray-600">Required Level: {data.requiredRating.toFixed(1)}</p>
        <p className="text-red-600">Gap: {data.gap.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};

const getBarColor = (config: ColorConfig, data: SkillData): string => {
  if (config.type === 'static') {
    return config.value;
  }
  return config.getValue(data);
};

export function CustomBarChart({
  data,
  xAxisKey,
  yAxisDomain = [0, 6],
  yAxisTicks = [0, 1.5, 3, 4.5, 6],
  series,
  height = 500,
}: BarChartProps) {
  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 120 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            height={100}
            interval={0}
            tick={CustomXAxisTick}
            tickLine={false}
          />
          <YAxis
            domain={yAxisDomain}
            ticks={yAxisTicks}
            tick={{ fill: '#666', fontSize: '11px' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: '50px',
              paddingBottom: '0px',
            }}
            content={({ payload }) => (
              <div className="flex justify-center items-center gap-8 pt-12">
                {payload?.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-2">
                    {entry.value === 'Skill Gap' ? (
                      <div className="w-3 h-3" style={{ backgroundColor: '#dc2626' }}></div>
                    ) : (
                      <div className="w-3 h-3" style={{ backgroundColor: entry.color }}></div>
                    )}
                    <span className="text-sm text-gray-700">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
          {series.map(s => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color.type === 'static' ? s.color.value : undefined}
              radius={[4, 4, 0, 0]}
            >
              {s.color.type === 'dynamic' &&
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(s.color, entry)} />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
