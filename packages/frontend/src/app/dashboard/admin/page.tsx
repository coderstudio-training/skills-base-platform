// app/dashboard/admin/page.tsx
import { AdminDashboard } from '@/blocks/Dashboard/components/Admin/index';
import { serverSideIntercept } from '@/lib/api/auth';

export default async function AdminDashboardPage() {
  await serverSideIntercept({ permission: 'canViewDashboard' });
  return <AdminDashboard />;
}
