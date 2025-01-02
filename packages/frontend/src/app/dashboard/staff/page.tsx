import StaffLoading from '@/app/dashboard/staff/loading';
import { serverSideIntercept } from '@/lib/api/auth';
import dynamic from 'next/dynamic';

const StaffDashboard = dynamic(() => import('@/components/Dashboard/components/Staff'), {
  ssr: false,
  loading: () => <StaffLoading />,
});

export default async function StaffDashboardPage() {
  const session = await serverSideIntercept({ permission: ['canViewDashboard'] });

  return <StaffDashboard {...session?.user} />;
}
