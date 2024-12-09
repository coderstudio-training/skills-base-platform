'use client';

import * as React from 'react';
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

interface DataPoint {
  [key: string]: string | number;
}

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DataPoint[];
  xAxisKey: string;
  yAxisDomain?: [number, number];
  yAxisTicks?: number[];
  series: { name: string; key: string; color: string }[];
  height?: number;
  title?: string;
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

export function CustomBarChart({
  data,
  xAxisKey,
  yAxisDomain = [0, 6],
  yAxisTicks = [0, 1.5, 3, 4.5, 6],
  series,
  height = 500,
  // title,
  // className,
  // ...props
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
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: '50px',
              paddingBottom: '0px',
            }}
          />
          {series.map(s => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
