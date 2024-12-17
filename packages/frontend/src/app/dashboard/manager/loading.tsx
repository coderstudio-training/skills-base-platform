import LoadingCard from '@/components/Dashboard/components/Cards/LoadingCard';
import LoadingHeader from '@/components/Dashboard/components/Header/LoadingHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function ManagerLoading() {
  return (
    <div className="container mx-auto p-4 max-w-[80%] select-none">
      <LoadingHeader />
      <div>
        <div className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full grid-cols-5">
          <div className="bg-white text-transparent inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 1 </Skeleton>
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 2 </Skeleton>
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 3 </Skeleton>
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 4 </Skeleton>
          </div>
          <div className=" inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-transparent">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 5 </Skeleton>
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
                  <div>
                    <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                      ****
                    </Skeleton>
                    <Skeleton className="bg-gray-300 text-xs text-transparent mt-1 w-1/4 rounded-md">
                      ****
                    </Skeleton>
                  </div>
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="bg-gray-200 rounded-xl border shadow bg-card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="bg-gray-300 rounded-md text-transparent font-semibold tracking-tight leading-none w-2/3">
                        Card Header
                      </Skeleton>
                      <Skeleton className="bg-gray-300 rounded-md text-sm text-transparent">
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
              <Skeleton className="bg-gray-200 rounded-xl border shadow bg-card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="bg-gray-300 rounded-md text-transparent font-semibold tracking-tight leading-none w-[90%]">
                        Card Header
                      </Skeleton>
                      <Skeleton className="bg-gray-300 rounded-md text-sm text-transparent">
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
                              <Skeleton className="bg-gray-300 relative flex shrink-0 overflow-hidden rounded-full h-10 w-10" />
                              <div>
                                <Skeleton className="bg-gray-300 rounded-md text-transparent font-medium ">
                                  First Middle Last Name
                                </Skeleton>
                                <Skeleton className="bg-gray-300 rounded-md text-sm text-transparent w-3/4 mt-1">
                                  Employee Job Title
                                </Skeleton>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3 ">
                              <Skeleton className="bg-gray-300 relative flex shrink-0 overflow-hidden rounded-full h-10 w-10" />
                              <div>
                                <Skeleton className="bg-gray-300 rounded-md text-transparent font-medium ">
                                  First Middle Last Name
                                </Skeleton>
                                <Skeleton className="bg-gray-300 rounded-md text-sm text-transparent w-3/4 mt-1">
                                  Employee Job Title
                                </Skeleton>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3 ">
                              <Skeleton className="bg-gray-300 relative flex shrink-0 overflow-hidden rounded-full h-10 w-10" />
                              <div>
                                <Skeleton className="bg-gray-300 rounded-md text-transparent font-medium ">
                                  First Middle Last Name
                                </Skeleton>
                                <Skeleton className="bg-gray-300 rounded-md text-sm text-transparent w-3/4 mt-1">
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
      </div>
    </div>
  );
}
