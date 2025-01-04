import { Skeleton } from '@/components/ui/skeleton';

const SkeletonTab = ({ iconClass, label }: { iconClass: string; label: string }) => (
  <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
    <Skeleton className={`bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm ${iconClass}`} />
    <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
      {label}
    </Skeleton>
  </div>
);

export default function AdminTabListLoading() {
  const tabs = [
    { iconClass: 'w-4 h-4', label: 'User' },
    { iconClass: 'w-4 h-4', label: 'Skills' },
    { iconClass: 'w-4 h-4', label: 'Required Skills' },
    { iconClass: 'w-4 h-4', label: 'Organization' },
    { iconClass: 'w-4 h-4', label: 'Metrics' },
    { iconClass: 'w-4 h-4', label: 'Learning' },
  ];

  return (
    <div className="space-y-4">
      <div
        aria-orientation="horizontal"
        className="inline-flex max-w-max overflow-y-hidden overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      >
        {tabs.map((tab, index) => (
          <SkeletonTab key={index} iconClass={tab.iconClass} label={tab.label} />
        ))}
      </div>
    </div>
  );
}
