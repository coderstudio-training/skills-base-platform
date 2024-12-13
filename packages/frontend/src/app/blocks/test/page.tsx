import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function ManagerLoading() {
  return (
    <div className="container mx-auto p-4 max-w-[80%] select-none">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="bg-gray-200 relative flex shrink-0 overflow-hidden rounded-full h-20 w-20" />
          <div className="flex flex-col space-y-1">
            <Skeleton className="bg-gray-200 rounded-lg text-3xl font-bold text-transparent">
              First Name Last Name
            </Skeleton>
            <Skeleton className="bg-gray-200 rounded-md w-3/4 text-transparent">
              Position - Business Unit
            </Skeleton>
            <Skeleton className="bg-gray-200 rounded-md inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold mt-1 text-transparent w-1/2">
              Career (Career Level)
            </Skeleton>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="bg-gray-200 inline-flex items-center justify-center rounded-md text-sm h-10 px-4 py-2 text-transparent">
            **** Settings
          </Skeleton>
          <Skeleton className="bg-gray-200 inline-flex items-center justify-center rounded-md text-sm h-10 px-4 py-2 text-transparent">
            **** Logout
          </Skeleton>
        </div>
      </div>
      <div>
        <div className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full grid-cols-5">
          <Skeleton className="bg-gray-300 text-transparent inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium">
            <Skeleton className="bg-gray-200 text-transparent rounded-sm">Tab List 1 </Skeleton>
          </Skeleton>
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
              <Skeleton className="bg-gray-200 rounded-xl border shadow bg-card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="bg-gray-300 rounded-md text-transparent font-semibold tracking-tight leading-none">
                        Card ****
                      </Skeleton>
                    </div>
                    <div className="ml-2"></div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                </div>
              </Skeleton>
              <Skeleton className="bg-gray-200 rounded-xl border shadow bg-card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="bg-gray-300 rounded-md text-transparent font-semibold tracking-tight leading-none">
                        Card ****
                      </Skeleton>
                    </div>
                    <div className="ml-2"></div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                </div>
              </Skeleton>
              <Skeleton className="bg-gray-200 rounded-xl border shadow bg-card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="bg-gray-300 rounded-md text-transparent font-semibold tracking-tight leading-none">
                        Card ****
                      </Skeleton>
                    </div>
                    <div className="ml-2"></div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Skeleton className="bg-gray-300 text-2xl rounded-md font-bold text-transparent">
                    ****
                  </Skeleton>
                  <Skeleton className="bg-gray-300 text-xs text-transparent mt-1 w-1/4 rounded-md">
                    ****
                  </Skeleton>
                </div>
              </Skeleton>
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
                      <div className="relative w-full h-full ">
                        <div className="flex flex-col items-center justify-center align-middle h-full w-full gap-2">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <p className="text-sm text-muted-foreground">Loading content...</p>
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
