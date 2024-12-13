// app/dashboard/admin/page.tsx
import AdminDashboard from '@/blocks/Dashboard/components/Admin';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function AdminDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  // Note: Not fully responsive dashboard. Loading & Actual page.
  return <AdminDashboard />;
}
