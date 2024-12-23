import { cn } from '@/lib/utils';
import * as React from 'react';
import { TooltipProps } from 'recharts';

interface SkillTooltipData {
  skill: string;
  average: number;
  requiredRating: number;
  gap: number;
}

export const CustomTooltip = React.forwardRef<HTMLDivElement, TooltipProps<number, string>>(
  (props, ref) => {
    const { active, payload } = props;

    if (active && payload?.length) {
      const data = payload[0].payload as SkillTooltipData;

      return (
        <div ref={ref} className="bg-background p-4 rounded-lg space-y-1 shadow-lg border">
          <p className="font-semibold mb-2">{data.skill}</p>
          <p className="text-blue-600">Current Level: {data.average.toFixed(1)}</p>
          <p className="text-gray-600">Required Level: {data.requiredRating.toFixed(1)}</p>
          <p className={cn(data.gap < 0 ? 'text-red-500' : 'text-green-500')}>
            Gap: {data.gap.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  },
);

CustomTooltip.displayName = 'CustomTooltip';
