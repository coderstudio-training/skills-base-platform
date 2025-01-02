import AdminLoading from '@/app/dashboard/admin/loading';
import { serverSideIntercept } from '@/lib/api/auth';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/Dashboard/components/Admin'), {
  ssr: false,
  loading: () => <AdminLoading />,
});

export default async function AdminDashboardPage() {
  await serverSideIntercept({ permission: ['canViewDashboard'] });

  return <AdminDashboard />;
}
