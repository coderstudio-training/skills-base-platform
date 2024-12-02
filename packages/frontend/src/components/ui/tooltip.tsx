import { cn } from '@/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';
import { TooltipProps } from 'recharts';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

export const CustomTooltip = React.forwardRef<HTMLDivElement, TooltipProps<number, string>>(
  (props, ref) => {
    const { active, payload } = props;

    if (active && payload?.length) {
      const data = payload[0].payload as {
        skill: string;
        average: number;
        requiredRating: number;
        gap: number;
      };

      return (
        <div ref={ref} className="bg-white p-4 rounded-lg space-y-1 shadow-lg border">
          <p className="font-semibold mb-2">{data.skill}</p>
          <p className="text-blue-600">Current Level: {data.average.toFixed(1)}</p>
          <p className="text-gray-600">Required Level: {data.requiredRating.toFixed(1)}</p>
          <p className="text-red-500">Gap: {data.gap.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  },
);

CustomTooltip.displayName = 'CustomTooltip';
