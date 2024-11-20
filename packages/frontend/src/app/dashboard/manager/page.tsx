import ManagerDashboard from '@/components/dashboard/manager/ManagerDashboard';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions);
  logger.log('Server-side session:', session);

  if (!session) {
    logger.log('No session, redirecting to login');
    redirect('/');
  }

  if (session.user.role !== 'manager') {
    logger.log('User is not manager, redirecting to unauthorized');
    redirect('/unauthorized');
  }

  logger.log('Rendering ManagerDashboard');
  return <ManagerDashboard />;
}
