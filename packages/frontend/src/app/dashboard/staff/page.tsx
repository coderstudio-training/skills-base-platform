import StaffDashboard from '@/components/Dashboard/components/Staff';

export default async function StaffDashboardPage() {
  // await serverSideIntercept({ permission: 'canViewDashboard' });
  return <StaffDashboard />;
}
