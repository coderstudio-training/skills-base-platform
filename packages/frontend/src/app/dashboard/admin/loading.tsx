import LoadingCard from '@/components/Dashboard/components/Cards/LoadingCard';
import AdminLoadingHeader from '@/components/Dashboard/components/Header/AdminLoadingHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="md:min-h-screen bg-gray-50 dark:bg-gray-950 select-none">
      <AdminLoadingHeader />
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
        {/* Stat Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <LoadingCard
            headerContent="Top Performers"
            skeleton_h_cn="bg-gray-200 dark:bg-gray-800 "
            bodyChildren={
              <div>
                {/* Table Header*/}
                <div className="bg-muted/50 rounded-t-lg">
                  <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium">
                    <Skeleton className="bg-gray-400 dark:bg-gray-600 text-transparent rounded-md w-fit col-span-2">
                      Rank
                    </Skeleton>
                    <Skeleton className="bg-gray-400 dark:bg-gray-600 text-transparent rounded-md w-fit col-span-8">
                      Employee Name
                    </Skeleton>
                    <div className="col-span-2 flex justify-end">
                      <Skeleton className="bg-gray-400 dark:bg-gray-600 text-transparent rounded-md ">
                        Score
                      </Skeleton>
                    </div>
                  </div>
                </div>
                {/* Table Rows*/}
                <div className="relative overflow-hidden h-[350px]">
                  <div className="h-full w-full rounded-[inherit]">
                    <div className="min-w-[100%] table">
                      <div className="divide-y">
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First M Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X.X
                            </Skeleton>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First Mid Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X.XX
                            </Skeleton>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X
                            </Skeleton>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First Name Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X.X
                            </Skeleton>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First M Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X.XX
                            </Skeleton>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First Middle Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X.X
                            </Skeleton>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 items-center transition-colors bg-muted/20">
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit font-medium rounded-md col-span-2 flex items-center gap-2">
                            X
                          </Skeleton>
                          <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md col-span-8">
                            First Last Name
                          </Skeleton>
                          <div className="col-span-2 flex justify-end">
                            <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent rounded-md max-w-[2rem]">
                              X
                            </Skeleton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <LoadingCard
            headerContent="Skill Gap Overview"
            skeleton_h_cn="bg-gray-200 dark:bg-gray-800"
            bodyChildren={
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                      Just Some Long Text
                    </Skeleton>
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-lg">
                      X.X
                    </Skeleton>
                  </div>
                  <div
                    aria-valuemax={100}
                    aria-valuemin={0}
                    className="animate-pulse bg-gray-400 relative w-full overflow-hidden rounded-full bg-primary/20 h-2.5"
                  ></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                      Just Some Long Text Variation 1
                    </Skeleton>
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-lg">
                      X.X
                    </Skeleton>
                  </div>
                  <div
                    aria-valuemax={100}
                    aria-valuemin={0}
                    className="animate-pulse bg-gray-400 relative w-full overflow-hidden rounded-full bg-primary/20 h-2.5"
                  ></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                      Just Text
                    </Skeleton>
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-lg">
                      X.X
                    </Skeleton>
                  </div>
                  <div
                    aria-valuemax={100}
                    aria-valuemin={0}
                    className="animate-pulse bg-gray-400 relative w-full overflow-hidden rounded-full bg-primary/20 h-2.5"
                  ></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                      Just Some Text
                    </Skeleton>
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-lg">
                      X.X
                    </Skeleton>
                  </div>
                  <div
                    aria-valuemax={100}
                    aria-valuemin={0}
                    className="animate-pulse bg-gray-400 relative w-full overflow-hidden rounded-full bg-primary/20 h-2.5"
                  ></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                      Just Some Long Text Var 2
                    </Skeleton>
                    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-lg">
                      X.X
                    </Skeleton>
                  </div>
                  <div
                    aria-valuemax={100}
                    aria-valuemin={0}
                    className="animate-pulse bg-gray-400 relative w-full overflow-hidden rounded-full bg-primary/20 h-2.5"
                  ></div>
                </div>
              </div>
            }
          />
          <LoadingCard
            skeleton_h_cn="bg-gray-200 dark:bg-gray-800"
            headerContent="Business Unit Distribution"
            bodyChildren={
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Unit Long Text
                  </Skeleton>
                  <Skeleton className="bg-gray-400 text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XXX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Unit Text
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XXX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Text A
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XXX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XXX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Unit
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XXX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business A
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Unit Long Text ABD
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Unit AB
                  </Skeleton>
                  <Skeleton className="bg-gray-400 text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    BU Text
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Unit Text A
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    XX
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    BU A
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    X
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Text AB
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    X
                  </Skeleton>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
                    Business Text
                  </Skeleton>
                  <Skeleton className="bg-gray-400  text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ">
                    X
                  </Skeleton>
                </div>
              </div>
            }
          />
        </div>

        {/* Tablist */}
        <div className="space-y-4">
          <div
            aria-orientation="horizontal"
            className="inline-flex max-w-max overflow-y-hidden overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
          >
            <div className="bg-white dark:bg-gray-950 text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-100 dark:bg-gray-800 text-transparent rounded-sm w-4 h-4 mr-2" />
              <Skeleton className="bg-gray-200 dark:bg-gray-800 text-transparent rounded-sm">
                User
              </Skeleton>
            </div>
            <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm w-4 h-4" />
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
                Skills
              </Skeleton>
            </div>
            <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm w-4 h-4" />
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
                Required Skills
              </Skeleton>
            </div>
            <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm w-4 h-4" />
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
                Organization
              </Skeleton>
            </div>
            <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm w-4 h-4" />
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
                Metrics
              </Skeleton>
            </div>
            <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm w-4 h-4" />
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
                Learning
              </Skeleton>
            </div>
            <div className="text-transparent justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm w-4 h-4" />
              <Skeleton className="bg-gray-200 dark:bg-gray-700 text-transparent rounded-sm">
                Taxonomy
              </Skeleton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
