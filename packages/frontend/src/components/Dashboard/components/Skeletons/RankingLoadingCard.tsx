import LoadingCard from '@/components/Dashboard/components/Skeletons/LoadingCard';
import { Skeleton } from '@/components/ui/skeleton';

const TableRowSkeleton = ({ rank, name, score }: { rank: string; name: string; score: string }) => (
  <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
      {rank}
    </Skeleton>
    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
      {name}
    </Skeleton>
    <div className="col-span-2 flex justify-end">
      <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
        {score}
      </Skeleton>
    </div>
  </div>
);

export default function RankingLoadingCard() {
  const skeletonRows = [
    { rank: 'X', name: 'First M Last Name', score: 'X.X' },
    { rank: 'X', name: 'First Mid Last Name', score: 'X.XX' },
    { rank: 'X', name: 'First Last Name', score: 'X' },
    { rank: 'X', name: 'First Name Last Name', score: 'X.X' },
    { rank: 'X', name: 'First M Last Name', score: 'X.XX' },
    { rank: 'X', name: 'First Middle Last Name', score: 'X.X' },
    { rank: 'X', name: 'First Last Name', score: 'X' },
  ];

  return (
    <LoadingCard
      headerContent="Top Performers"
      skeleton_h_cn="bg-gray-200 dark:bg-gray-800 "
      bodyChildren={
        <div>
          {/* Table Header */}
          <div className="bg-muted/50 rounded-t-lg">
            <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium">
              <Skeleton className="bg-gray-400 dark:bg-gray-600 text-transparent rounded-md w-fit col-span-2">
                Rank
              </Skeleton>
              <Skeleton className="bg-gray-400 dark:bg-gray-600 text-transparent rounded-md w-fit col-span-8">
                Employee Name
              </Skeleton>
              <div className="col-span-2 flex justify-end">
                <Skeleton className="bg-gray-400 dark:bg-gray-600 text-transparent rounded-md">
                  Score
                </Skeleton>
              </div>
            </div>
          </div>
          {/* Table Rows */}
          <div className="relative overflow-hidden h-[350px]">
            <div className="h-full w-full rounded-[inherit]">
              <div className="min-w-[100%] table">
                <div className="divide-y">
                  {skeletonRows.map((row, index) => (
                    <TableRowSkeleton
                      key={index}
                      rank={row.rank}
                      name={row.name}
                      score={row.score}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
