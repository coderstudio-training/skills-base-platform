import { Skeleton } from '@/blocks/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Skeleton className="h-16 w-full mb-4 border" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <Skeleton className="h-9 border rounded-md px-3 py-2 min-w-[200px] w-fit" />
            <div className="relative flex-1 max-w-[300px]">
              <Skeleton className="flex border h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 border w-10 rounded-md" />
          </div>
        </div>
        {/* Admin Metric Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Skeleton className="w-[405.33px] h-[122px] border rounded-xl" />
          <Skeleton className="w-[405.33px] h-[122px] border rounded-xl" />
          <Skeleton className="w-[405.33px] h-[122px] border rounded-xl" />
        </div>
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Skeleton className="rounded-xl border h-[498px]" />
          <Skeleton className="rounded-xl border h-[498px]" />
          <Skeleton className="rounded-xl border  h-[498px]" />
        </div>

        {/* Tablist */}
        <div className="space-y-4">
          <Skeleton className="inline-flex h-9 border rounded-lg p-1 w-[784px]" />
          <div className="mt-2"></div>
        </div>
      </main>
    </div>
  );
}
