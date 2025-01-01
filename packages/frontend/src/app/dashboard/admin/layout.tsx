import { ErrorBoundary } from '@/components/Dashboard/components/ErrorBoundary/ErrorBoundary';
import AdminLoadingHeader from '@/components/Dashboard/components/Skeletons/AdminLoadingHeader';
import ErrorPage from '@/components/error/ErrorPage';
import { Suspense, lazy } from 'react';

const AdminDashboardHeader = lazy(
  () => import('@/components/Dashboard/components/Header/AdminHeader'),
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorPage statusCode={500} message="Something went wrong while loading the page" />
      }
    >
      <Suspense fallback={<AdminLoadingHeader />}>
        <AdminDashboardHeader />
      </Suspense>
      {children}
    </ErrorBoundary>
  );
}
