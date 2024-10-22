import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import { logger } from '@/lib/utils';

export default async function StaffDashboardPage() {
  const session = await getServerSession(authOptions);
  logger.log('Server-side session:', session);

  if (!session) {
    logger.log('No session, redirecting to login');
    redirect('/');
  }

  if (session.user.role !== 'staff') {
    logger.log('User is not staff, redirecting to unauthorized');
    redirect('/unauthorized');
  }

  logger.log('Rendering StaffDashboard');
  return <StaffDashboard />;
}
