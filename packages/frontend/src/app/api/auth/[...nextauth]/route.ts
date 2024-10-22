import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/utils';

logger.log('NextAuth API route hit:', new Date().toISOString());

const handler = NextAuth(authOptions);

logger.log('NextAuth handler created');

export { handler as GET, handler as POST };
