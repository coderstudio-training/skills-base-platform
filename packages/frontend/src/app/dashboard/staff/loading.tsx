import LoadingCard from '@/components/Dashboard/components/Cards/LoadingCard';
import LoadingHeader from '@/components/Dashboard/components/Header/LoadingHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function StaffLoading() {
  return (
    <div className="container mx-auto p-4 max-w-[80%] select-none">
      <LoadingHeader />
      <div>
        <div className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full grid-cols-3">
          <div className="bg-white text-transparent inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 1 </Skeleton>
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 2 </Skeleton>
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 3 </Skeleton>
          </div>
        </div>
        <div className="mt-2 space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <LoadingCard
                bodyChildren={
                  <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                }
              />
              <LoadingCard
                bodyChildren={
                  <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                }
              />
              <LoadingCard
                bodyChildren={
                  <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                }
              />
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="bg-gray-300 rounded-md w-2/3 leading-none font-semibold tracking-tight text-transparent">
                      Card Header
                    </Skeleton>
                    <Skeleton className="bg-gray-200 rounded-md text-sm text-transparent">
                      Card Subtitle Description
                    </Skeleton>
                  </div>
                  <div className="ml-2">
                    <div className="space-x-2">
                      <Skeleton className="bg-gray-300 rounded-md px-3 inline-flex items-center justify-center text-sm font-medium h-9 text-transparent">
                        Technical Skills
                      </Skeleton>
                      <Skeleton className="bg-gray-100 rounded-md px-3 inline-flex items-center justify-center text-sm font-medium h-9 text-transparent">
                        Soft Skills
                      </Skeleton>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
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
          </div>
        </div>
      </div>
    </div>
  );
}
