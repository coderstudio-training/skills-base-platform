import ManagerDashboard from '@/components/dashboard/manager/ManagerDashboard';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function ManagerDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <ManagerDashboard />;
}
