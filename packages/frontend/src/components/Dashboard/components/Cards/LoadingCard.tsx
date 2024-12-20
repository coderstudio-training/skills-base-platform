import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LoadingCardProps } from '../../types';

export default function LoadingCard({
  skeleton_cn,
  div_h1_cn,
  div_h2_cn,
  div_h3_cn,
  skeleton_h_cn = 'bg-gray-300 dark:bg-gray-700',
  div_b1_cn,
  headerContent = 'Card ****',
  bodyChildren,
}: LoadingCardProps) {
  return (
    <Skeleton className={cn('rounded-xl border shadow bg-card', skeleton_cn)}>
      <div className={cn('flex flex-col space-y-1.5 p-6', div_h1_cn)}>
        <div className={cn('flex items-center justify-between', div_h2_cn)}>
          <div className={cn('flex flex-col space-y-1.5', div_h3_cn)}>
            <Skeleton
              className={cn(
                'rounded-md text-transparent font-semibold tracking-tight leading-none',
                skeleton_h_cn,
              )}
            >
              {headerContent}
            </Skeleton>
          </div>
        </div>
      </div>
      <div className={cn('p-6 pt-0', div_b1_cn)}>{bodyChildren}</div>
    </Skeleton>
  );
}
