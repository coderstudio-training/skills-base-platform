import { serverSideIntercept } from '@/lib/api/auth';
import dynamic from 'next/dynamic';
import ManagerLoading from './loading';

const ManagerDashboard = dynamic(() => import('@/components/Dashboard/components/Manager'), {
  ssr: false,
  loading: () => <ManagerLoading />,
});
export default async function ManagerDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  // Note: Almost responsive dashboard. Modify header
  return <ManagerDashboard />;
}
