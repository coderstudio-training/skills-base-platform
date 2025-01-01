import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoadingHeader() {
  return (
    <header className="bg-background border-b w-screen overflow-x-hidden">
      <div className="h-auto sm:h-16 max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col p-1 sm:p-0 sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Skeleton className="text-lg rounded-md sm:text-xl font-bold text-transparent">
            Admin Dashboard
          </Skeleton>
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary">
            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-sm">
              Last synced: Dec 13, 4:17 PM
            </Skeleton>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="bg-gray-100 dark:bg-gray-950 inline-flex items-center justify-center rounded-md text-sm text-transparent font-medium border h-10 px-4 py-2">
            Generate Report
          </Skeleton>
          <Skeleton className="bg-gray-100 dark:bg-gray-950 inline-flex items-center justify-center rounded-md text-sm text-transparent font-medium border h-10 w-10 relative" />
          <Skeleton className="dark:bg-gray-950 inline-flex items-center justify-center rounded-md text-sm text-transparent font-medium border h-10 w-10 relative" />
          <Skeleton className="dark:bg-gray-950 inline-flex items-center justify-center rounded-full text-sm text-transparent font-medium border h-8 w-8 relative" />
        </div>
      </div>
    </header>
  );
}
