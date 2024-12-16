import ManagerDashboard from '@/components/Dashboard/components/Manager';

export default async function ManagerDashboardPage() {
  // await serverSideIntercept({ permission: 'canViewDashboard' });
  // Note: Almost responsive dashboard. Modify header
  return <ManagerDashboard />;
}
