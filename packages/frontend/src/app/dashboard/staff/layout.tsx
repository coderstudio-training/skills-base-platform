import { ErrorBoundary } from '@/components/Dashboard/components/ErrorBoundary/ErrorBoundary';
import LoadingHeader from '@/components/Dashboard/components/Skeletons/LoadingHeader';
import ErrorPage from '@/components/error/ErrorPage';
import { lazy, Suspense } from 'react';

const UserHeader = lazy(() => import('@/components/Dashboard/components/Header/UserHeader'));

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorPage statusCode={500} message="Something went wrong while loading the page" />
      }
    >
      <Suspense fallback={<LoadingHeader />}>
        <UserHeader />
      </Suspense>
      {children}
    </ErrorBoundary>
  );
}
