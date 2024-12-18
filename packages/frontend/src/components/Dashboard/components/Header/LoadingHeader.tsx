'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingHeader() {
  return (
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
  );
}
