import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function SkillsOverviewLoading() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md w-2/3 leading-none font-semibold tracking-tight text-transparent">
              Card Header
            </Skeleton>
            <Skeleton className="bg-gray-200 dark:bg-gray-800 rounded-md text-sm text-transparent">
              Card Subtitle Description
            </Skeleton>
          </div>
          <div className="ml-2">
            <div className="space-x-2">
              <Skeleton className="bg-gray-300 dark:bg-gray-700 rounded-md px-3 inline-flex items-center justify-center text-sm font-medium h-9 text-transparent">
                Technical Skills
              </Skeleton>
              <Skeleton className="bg-gray-100 dark:bg-gray-900 rounded-md px-3 inline-flex items-center justify-center text-sm font-medium h-9 text-transparent">
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
  );
}
