// app/dashboard/admin/page.tsx
import AdminDashboard from '@/components/Dashboard/components/Admin';

export default async function AdminDashboardPage() {
  // await serverSideIntercept({ permission: 'canViewDashboard' });
  // Note: Not fully responsive dashboard. Loading & Actual page.
  return <AdminDashboard />;
}
