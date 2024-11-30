// app/dashboard/admin/page.tsx
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function AdminDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <AdminDashboard />;
}
