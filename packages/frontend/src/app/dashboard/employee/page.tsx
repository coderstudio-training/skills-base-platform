import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getEmployeeData } from '@/lib/api/employee';
import { EmployeeData } from '@/types/employee';

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'employee') {
    redirect('/auth/login');
  }

  const employeeData: EmployeeData = await getEmployeeData(session.user.id);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EmployeeDashboard initialData={employeeData} />
    </Suspense>
  );
}
