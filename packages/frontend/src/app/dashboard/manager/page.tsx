import ManagerDashboard from '@/blocks/Dashboard/components/Manager';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function ManagerDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  // Note: Almost responsive dashboard. Modify header
  return <ManagerDashboard />;
}
