import StaffDashboard from '@/components/dashboard/StaffDashboard';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function StaffDashboardPage() {
  await serverSideIntercept({ permission: 'canEditAllSkills' });
  return <StaffDashboard />;
}
