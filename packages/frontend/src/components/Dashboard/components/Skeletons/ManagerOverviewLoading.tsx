import OverviewCardLoading from '@/components/Dashboard/components/Skeletons/OverviewCardLoading';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function ManagerOverviewLoadingCard() {
  return (
    <div className="mt-2 space-y-4">
      <div className="space-y-4">
        <OverviewCardLoading extra_text={true} />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="bg-gray-200 dark:bg-gray-800 rounded-xl border shadow bg-card">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-transparent font-semibold tracking-tight leading-none w-2/3">
                    Card Header
                  </Skeleton>
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-sm text-transparent">
                    Card Description Lorem Ipsum
                  </Skeleton>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="flex flex-col items-center gap-2">
                <div className="w-full h-[400px] min-w-0">
                  <div className="relative w-full h-full">
                    <div className="flex flex-col items-center justify-center align-middle h-full w-full gap-2">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <div className="text-sm text-muted-foreground">Loading content...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Skeleton>
          <Skeleton className="bg-gray-200 dark:bg-gray-800 rounded-xl border shadow bg-card">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-transparent font-semibold tracking-tight leading-none w-[90%]">
                    Card Header
                  </Skeleton>
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-sm text-transparent">
                    Card Description
                  </Skeleton>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="relative overflow-hidden h-[400px]">
                <div className="h-full w-full rounded-[inherit]">
                  <div className="min-w-[100%] table">
                    <div className="space-y-4 pr-4">
                      <div className="flex items-center justify-between p-2 rounded-lg">
                        <div className="flex items-center gap-3 ">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 relative flex shrink-0 overflow-hidden rounded-full h-10 w-10" />
                          <div>
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-transparent font-medium ">
                              First Middle Last Name
                            </Skeleton>
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-sm text-transparent w-3/4 mt-1">
                              Employee Job Title
                            </Skeleton>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg">
                        <div className="flex items-center gap-3 ">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 relative flex shrink-0 overflow-hidden rounded-full h-10 w-10" />
                          <div>
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-transparent font-medium ">
                              First Middle Last Name
                            </Skeleton>
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-sm text-transparent w-3/4 mt-1">
                              Employee Job Title
                            </Skeleton>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg">
                        <div className="flex items-center gap-3 ">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 relative flex shrink-0 overflow-hidden rounded-full h-10 w-10" />
                          <div>
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-transparent font-medium ">
                              First Middle Last Name
                            </Skeleton>
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md text-sm text-transparent w-3/4 mt-1">
                              Employee Job Title
                            </Skeleton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Skeleton>
        </div>
      </div>
    </div>
  );
}
