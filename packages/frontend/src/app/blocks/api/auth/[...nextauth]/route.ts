import { authOptions } from '@/lib/api/auth';
import { logger } from '@/lib/utils';
import NextAuth from 'next-auth/next';

logger.log('NextAuth API route hit:', new Date().toISOString());

const handler = NextAuth(authOptions);

logger.log('NextAuth handler created');

export { handler as GET, handler as POST };
