import { authOptions } from '@/lib/api/auth';
import { logger } from '@/lib/utils/logger';
import NextAuth from 'next-auth/next';

logger.info('NextAuth API route hit:' + new Date().toISOString());

const handler = NextAuth(authOptions);

logger.info('NextAuth handler created');

export { handler as GET, handler as POST };
