// lib/auth.ts

import { authConfig, errorMessages } from '@/lib/api/config';
import { Permission, Roles, ServerInterceptOptions } from '@/lib/api/types';
import { logger } from '@/lib/utils/logger';
import { AuthResponse, DecodedToken } from '@/types/auth';
import { jwtDecode } from 'jwt-decode';
import { getServerSession, NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { getPermissionCode } from './permissionMapping';
logger.info('Starting to load auth options in lib/auth.ts...');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        access_token: { label: 'Access Token', type: 'text' },
      },
      async authorize(credentials): Promise<AuthResponse | null> {
        logger.info(
          'Authorize function called with credentials: ' + JSON.stringify(credentials, null, 2),
        );

        logger.info('Starting authorize function');
        if (!credentials?.access_token) {
          logger.error('No access token provided');
          return null;
        }

        try {
          logger.info('Decoding token');
          const decodedToken = jwtDecode<DecodedToken>(credentials.access_token);
          logger.info(`Decoded token: ${JSON.stringify(decodedToken)}`);
          // Validate the decoded token
          if (
            !decodedToken.email ||
            !decodedToken.userId ||
            !Array.isArray(decodedToken.roles) ||
            !Array.isArray(decodedToken.perms)
          ) {
            logger.error('Invalid token structure');
            return null;
          }

          // Check token expiration
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            logger.error('Token has expired');
            return null;
          }

          const role = decodedToken.roles.includes('admin')
            ? 'admin'
            : decodedToken.roles.includes('manager')
              ? 'manager'
              : 'staff';

          return {
            id: decodedToken.userId,
            name: decodedToken.email.split('@')[0], // You might want to adjust this
            email: decodedToken.email,
            accessToken: credentials.access_token,
            role: role,
            perms: decodedToken.perms,
          };
        } catch (error) {
          logger.error('Token decode error: ' + error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      logger.info('Starting Google login...');
      try {
        if (account?.provider === 'google') {
          // Call your user service to check/create user and get role
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}${authConfig.endpoints.googleAuth}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: account.id_token,
              }),
            },
          );
          const data = await response.json();
          logger.info('Google Auth: ' + JSON.stringify(data));

          if (response.ok) {
            // decode token for perms
            logger.info('Decoding token');
            const decodedToken = jwtDecode<DecodedToken>(data.access_token);

            if (
              !decodedToken.email ||
              !decodedToken.userId ||
              !Array.isArray(decodedToken.roles) ||
              !Array.isArray(decodedToken.perms)
            ) {
              logger.error('Invalid token structure');
              return '/auth/error';
            }

            // Check token expiration
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              logger.error('Token has expired');
              return '/auth/error';
            }

            user.role = data.roles[0];
            user.accessToken = data.access_token;
            user.image = profile?.image;
            user.perms = decodedToken.perms;

            return true;
          } else {
            return '/auth/error';
          }
        }
        return true;
      } catch (error) {
        logger.error('Sign in error:' + error);
        return false;
      }
    },
    async jwt({ token, user }) {
      logger.info('JWT Callback - Token:' + JSON.stringify(token));
      logger.info('JWT Callback - User:' + user ? JSON.stringify(user) : 'No user');
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.perms = user.perms;
      }
      return token;
    },
    async session({ session, token }) {
      logger.info('Session Callback - Token:' + JSON.stringify(token));
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        accessToken: token.accessToken as string,
        image: token.picture as string,
        role: token.role as Roles,
        perms: token.perms as number[],
      };
      logger.info('Session Callback - Session:' + JSON.stringify(session));
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Customize the redirect based on the user's role
      if (url.startsWith(baseUrl)) {
        logger.info('Redirecting to:' + url);
        const session = await getSession();
        if (session?.user?.role) {
          return `${baseUrl}/dashboard/${session.user.role.toLowerCase()}`;
        }
      }
      return url;
    },
  },
  pages: {
    signIn: '/admin-login',
    //error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

// Handles the auth headers instead of manually calling getSession() all the time.
export async function getAuthHeaders(): Promise<HeadersInit> {
  let session;

  // Check if running on the server or client
  if (typeof window === 'undefined') {
    // On the server-side, use getServerSession
    logger.info('getting server side session');
    session = await getServerSession(authOptions);
  } else {
    // On the client-side, use getSession
    logger.info('getting client side session');
    session = await getSession();
  }

  // If no session or accessToken, return empty headers
  if (!session?.user?.accessToken) {
    logger.warn('Unauthorized: No session or accessToken');
    return {};
  }

  // Return the authorization header with the token
  return { Authorization: `Bearer ${session.user.accessToken}` };
}

// Helper function, gets logged in user's role
async function getRoles(session: Session): Promise<Roles[]> {
  return session?.user?.role ? [session.user.role] : [];
}

// Checks the predefined permissions list if user has permission
export async function hasPermission(session: Session, permissions: Permission[]): Promise<boolean> {
  return permissions.every(permission =>
    session.user.perms.includes(getPermissionCode(permission)),
  );
}

// Checks the predefined routes if user has access
export async function canAccessRoutes(session: Session, route: string): Promise<boolean> {
  const roles = await getRoles(session);

  if (!roles.length) return false;

  return roles.some(role => authConfig.routes[role].includes(route));
}

export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const [, payload] = token.split('.'); // Access the payload part of the JWT
    if (!payload) return true;

    const { exp } = JSON.parse(atob(payload)); // Decode the base64 payload
    if (!exp) return true;

    // Check if the token is expired
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Assume expired if parsing fails
  }
}

export async function serverSideIntercept(option?: ServerInterceptOptions) {
  const session = await getServerSession(authOptions);
  logger.info('Server-side session:' + session);

  if (!session) {
    logger.info(errorMessages.UNAUTHORIZED);
    redirect(`${process.env.NEXTAUTH_URL}/error/unauthorized`);
  } else {
    const tokenExpired = await isTokenExpired(session?.user.accessToken);
    if (tokenExpired) {
      logger.info(errorMessages.TOKEN_EXPIRED);
      redirect(`${process.env.NEXTAUTH_URL}/error/unauthorized`);
    }
  }

  if (option?.role) {
    if (session.user.role !== option.role) {
      logger.info(errorMessages.UNAUTHORIZED);
      redirect(`${process.env.NEXTAUTH_URL}/error/unauthorized`);
    }
  }

  if (option?.permission) {
    const isPermitted = await hasPermission(session, option.permission);
    if (!isPermitted) {
      logger.info(errorMessages.FORBIDDEN);
      redirect(`${process.env.NEXTAUTH_URL}/error/forbidden`);
    }
  }

  if (option?.route) {
    const canAccess = await canAccessRoutes(session, option.route);
    if (!canAccess) {
      logger.info(errorMessages.FORBIDDEN);
      redirect(`${process.env.NEXTAUTH_URL}/error/forbidden`);
    }
  }

  return session;
}
