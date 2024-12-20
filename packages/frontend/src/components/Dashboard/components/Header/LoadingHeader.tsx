'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingHeader() {
  return (
    <header className="overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
        <div className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 text-center md:text-left">
          <Skeleton className="bg-gray-200 dark:bg-gray-800 relative flex shrink-0 overflow-hidden rounded-full h-20 w-20" />
          <div className="flex flex-col space-y-1 items-center md:items-start">
            <Skeleton className="bg-gray-200 dark:bg-gray-800  rounded-lg text-lg md:text-2xl font-bold text-transparent">
              First Name Last Name
            </Skeleton>
            <Skeleton className="bg-gray-200 dark:bg-gray-800  rounded-md md:w-3/4 text-sm md:text-md text-transparent">
              Position - Business
            </Skeleton>
            <Skeleton className="bg-gray-200 dark:bg-gray-800  rounded-md inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold mt-1 text-transparent md:w-1/2">
              Career
            </Skeleton>
          </div>
        </div>
        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-y-0 sm:space-x-4">
          <Skeleton className="bg-gray-100 dark:bg-gray-900 inline-flex items-center justify-center rounded-md text-sm text-transparent font-medium border h-10 w-10 relative" />
          <Skeleton className="bg-gray-200 dark:bg-gray-800  inline-flex items-center justify-center rounded-md text-sm h-10 px-4 py-2 text-transparent">
            **** Settings
          </Skeleton>
          <Skeleton className="bg-gray-200 dark:bg-gray-800  inline-flex items-center justify-center rounded-md text-sm h-10 px-4 py-2 text-transparent">
            **** Logout
          </Skeleton>
        </div>
      </div>
    </header>
  );
}
