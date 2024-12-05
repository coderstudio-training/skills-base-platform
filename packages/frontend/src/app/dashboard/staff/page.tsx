import { serverSideIntercept } from '@/lib/api/auth';
import StaffDashboard from '../../../blocks/Dashboard/components/Staff/StaffDashboard';

export default async function StaffDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <StaffDashboard />;
}
