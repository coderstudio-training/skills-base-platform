import { ErrorBoundary } from '@/components/Dashboard/components/ErrorBoundary/ErrorBoundary';
import LoadingHeader from '@/components/Dashboard/components/Skeletons/LoadingHeader';
import ErrorPage from '@/components/error/ErrorPage';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const UserHeader = dynamic(() => import('@/components/Dashboard/components/Header/UserHeader'), {
  ssr: false,
  loading: () => <LoadingHeader />,
});

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
