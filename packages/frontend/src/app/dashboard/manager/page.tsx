import ManagerLoading from '@/app/dashboard/manager/loading';
import { serverSideIntercept } from '@/lib/api/auth';
import dynamic from 'next/dynamic';

const ManagerDashboard = dynamic(() => import('@/components/Dashboard/components/Manager'), {
  ssr: false,
  loading: () => <ManagerLoading />,
});
export default async function ManagerDashboardPage() {
  const session = await serverSideIntercept({ permission: ['canViewDashboard'] });
  return <ManagerDashboard {...session?.user} />;
}
