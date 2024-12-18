import StaffDashboard from '@/components/Dashboard/components/Staff';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function StaffDashboardPage() {
  const session = await serverSideIntercept({ permission: 'canViewDashboard' });

  return <StaffDashboard {...session?.user} />;
}
