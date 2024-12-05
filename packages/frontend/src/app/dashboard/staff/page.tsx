import StaffDashboard from '@/blocks/Dashboard/components/Staff';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function StaffDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <StaffDashboard />;
}
