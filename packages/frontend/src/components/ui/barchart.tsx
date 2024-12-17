'use client';

import { CustomTooltip } from '@/components/ui/tooltip';
import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

interface SkillData {
  skill: string;
  average: number;
  requiredRating: number;
  gap: number;
  [key: string]: string | number; // For additional properties
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
  tooltipFormatter?: (
    value: number | string,
    name: string,
    entry: { payload: SkillData },
  ) => number | string;
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
  // tooltipFormatter,
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
          <CustomTooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: '50px',
              paddingBottom: '0px',
            }}
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
