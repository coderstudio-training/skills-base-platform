import ManagerDashboard from '@/components/Dashboard/components/Manager';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function ManagerDashboardPage() {
  const session = await serverSideIntercept({ permission: 'canViewDashboard' });
  return <ManagerDashboard {...session?.user} />;
}
