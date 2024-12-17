import { ErrorBoundary } from '@/components/Dashboard/components/ErrorBoundary/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
