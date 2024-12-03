import StaffDashboard from '@/components/dashboard/components/staff/StaffDashboard';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function StaffDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <StaffDashboard />;
}
