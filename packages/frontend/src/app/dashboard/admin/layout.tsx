import { ErrorBoundary } from '@/components/Dashboard/components/ErrorBoundary/ErrorBoundary';
import ErrorPage from '@/components/error/ErrorPage';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorPage statusCode={500} message="Something went wrong while loading the page" />
      }
    >
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
