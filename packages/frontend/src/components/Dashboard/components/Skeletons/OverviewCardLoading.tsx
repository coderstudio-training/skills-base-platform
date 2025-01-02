import LoadingCard from '@/components/Dashboard/components/Skeletons/LoadingCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverviewCardLoading({
  card_count = 3,
  extra_text = false,
}: {
  card_count?: number;
  extra_text?: boolean;
}) {
  return (
    <div className={`grid gap-4 lg:grid-cols-${card_count}`}>
      {Array.from({ length: card_count }).map((_, index) => (
        <LoadingCard
          key={index}
          bodyChildren={
            <div>
              <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-md font-bold text-transparent">
                ****
              </Skeleton>
              {extra_text && (
                <Skeleton className="bg-gray-300 dark:bg-gray-700 text-xs text-transparent mt-1 w-1/4 rounded-md">
                  ****
                </Skeleton>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
}
