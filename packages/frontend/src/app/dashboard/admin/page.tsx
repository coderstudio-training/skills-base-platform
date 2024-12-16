// app/dashboard/admin/page.tsx
import AdminDashboard from '@/components/Dashboard/components/Admin';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function AdminDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <AdminDashboard />;
}
