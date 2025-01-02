import { Skeleton } from '@/components/ui/skeleton';

export default function TabListLoading({ tab_count = 1 }: { tab_count?: number }) {
  return (
    <div
      className={`h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full ${`grid-cols-${tab_count}`}`}
    >
      <div className="bg-background text-transparent inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium">
        <Skeleton className="bg-gray-200 dark:bg-gray-800 text-transparent rounded-sm">
          Tab List 1{' '}
        </Skeleton>
      </div>
      {Array.from({ length: tab_count - 1 }).map((_, index) => (
        <div
          key={index}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent"
        >
          <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
            Tab List {index + 2}{' '}
          </Skeleton>
        </div>
      ))}
    </div>
  );
}
