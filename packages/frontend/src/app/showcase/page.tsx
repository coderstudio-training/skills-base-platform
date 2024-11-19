import { authOptions } from '@/lib/api/auth';
import ShowcaseDashboard from '@/lib/api/example';
import { logger } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ShowcasePage() {
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

  return <ShowcaseDashboard />;
}
