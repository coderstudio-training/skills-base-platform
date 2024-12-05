import { ManagerDashboard } from '@/blocks/Dashboard/components/Manager/index';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function ManagerDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <ManagerDashboard />;
}
