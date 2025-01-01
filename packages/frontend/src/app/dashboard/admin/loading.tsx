import AdminMetricCardLoading from '@/components/Dashboard/components/Skeletons/AdminMetricCardLoading';
import AdminTabListLoading from '@/components/Dashboard/components/Skeletons/AdminTabListLoading';
import StatsLoadingCard from '@/components/Dashboard/components/Skeletons/StatsLoadingCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="md:min-h-screen bg-gray-50 dark:bg-gray-950 select-none">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm min-w-[200px] w-fit">
              <div className="flex items-center">
                <Skeleton className="bg-gray-200 dark:bg-gray-800 text-transparent rounded-sm w-4 h-4 mr-2" />
                <Skeleton className="bg-gray-200 dark:bg-gray-800 text-transparent rounded-sm">
                  All Business Units
                </Skeleton>
              </div>
              <Skeleton className="bg-gray-200 dark:bg-gray-800 text-transparent rounded-sm w-4 h-4" />
            </div>
            <div className="relative flex-1 max-w-[300px]">
              <Skeleton className="bg-gray-200 dark:bg-gray-800 text-transparent rounded-sm absolute left-2 top-2.5 w-4 h-4" />
              <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                <Skeleton className="bg-gray-200 dark:bg-gray-800 rounded-md w-fit text-transparent ml-5">
                  Search by name or email...
                </Skeleton>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className=" inline-flex items-center justify-center rounded-md text-sm text-transparent font-medium border h-10 w-10 relative" />
          </div>
        </div>
        {/* Admin Metric Cards */}
        <AdminMetricCardLoading />
        {/* Stat Cards */}
        <StatsLoadingCard />
        {/* Tablist */}
        <AdminTabListLoading />
      </main>
    </div>
  );
}
