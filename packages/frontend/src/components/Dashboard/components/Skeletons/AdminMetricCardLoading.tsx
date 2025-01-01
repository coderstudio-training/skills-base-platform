import LoadingCard from '@/components/Dashboard/components/Skeletons/LoadingCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminMetricCardLoading() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <LoadingCard
        headerContent="Total Employees"
        skeleton_h_cn="bg-gray-200 dark:bg-gray-800 "
        bodyChildren={
          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-lg font-bold text-transparent w-1/4">
            ****
          </Skeleton>
        }
      />
      <LoadingCard
        headerContent="Departments"
        skeleton_h_cn="bg-gray-200 dark:bg-gray-800 "
        bodyChildren={
          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-lg font-bold text-transparent w-1/5">
            ****
          </Skeleton>
        }
      />
      <LoadingCard
        headerContent="Active Employees"
        skeleton_h_cn="bg-gray-200 dark:bg-gray-800 "
        bodyChildren={
          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-lg font-bold text-transparent w-1/6">
            ****
          </Skeleton>
        }
      />
    </div>
  );
}
