import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import LoadingCard from '@/components/Dashboard/components/Skeletons/LoadingCard';
import { ColumnConfig } from '@/components/Dashboard/components/Tables/DataTable';
import { Skill } from '@/components/Dashboard/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function StaffSkillsOverviewLoading() {
  const selectedCategory = 'Technical Skills';
  const columns: ColumnConfig<Skill>[] = [
    {
      header: 'Skill',
      key: 'name',
      width: 'w-[30%]',
    },
    {
      header: 'Self Rating',
      key: 'selfRating',
      width: 'w-[20%]',
    },
    {
      header: 'Manager Rating',
      key: 'managerRating',
      width: 'w-[20%]',
    },
    {
      header: 'Required Level',
      key: 'required',
      width: 'w-[15%]',
      align: 'center',
    },
    {
      header: 'Status',
      key: 'status',
      width: 'w-[15%]',
    },
  ];

  return (
    <div className="space-y-4 mt-2">
      <BaseCard
        title="Skill Gaps Analysis"
        headerExtra={
          <div className="space-x-2">
            <Button variant={'default'} size="sm">
              Technical Skills
            </Button>
            <Button variant={'outline'} size="sm">
              Soft Skills
            </Button>
          </div>
        }
      >
        <div className="h-[450px] w-full flex flex-col items-center justify-center align-middle">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="text-sm text-muted-foreground">Loading skill gaps analysis...</div>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2">Detailed Gap Analysis</h4>
          <p className="text-sm text-gray-600 mb-4">
            Breakdown of your {selectedCategory.toLowerCase()}
          </p>
          <div className="rounded-md border">
            <div className="bg-gray-200 dark:bg-gray-800 border-b">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`py-4 px-6 text-gray-600 dark:text-gray-400 font-normal text-sm ${
                          column.width || ''
                        } text-${column.align || 'left'}`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
            <div className="h-[360px] rounded-md border w-full flex flex-col items-center justify-center align-middle">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div className="text-sm text-muted-foreground">Loading detailed gap analysis...</div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h4 className="text-md font-semibold mb-2">{selectedCategory} Summary</h4>
          <div className="grid grid-cols-4 gap-4">
            <LoadingCard
              bodyChildren={
                <div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                </div>
              }
            />
            <LoadingCard
              bodyChildren={
                <div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                </div>
              }
            />
            <LoadingCard
              bodyChildren={
                <div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                </div>
              }
            />
            <LoadingCard
              bodyChildren={
                <div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                </div>
              }
            />
          </div>
        </div>
      </BaseCard>
    </div>
  );
}
