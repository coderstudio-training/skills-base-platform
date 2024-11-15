// lib/auth.ts

import { logger } from '@/lib/utils';
import { AuthResponse, DecodedToken } from '@/types/auth';
import { jwtDecode } from 'jwt-decode';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getSession } from 'next-auth/react';
import { authConfig, errorMessages, rolePermissions } from './config';
import { AuthState, Permission, RolePermissions, Roles } from './types';
logger.log('Starting to load auth options in lib/auth.ts...');

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
        logger.log(
          'Authorize function called with credentials: ' + JSON.stringify(credentials, null, 2),
        );

        logger.log('Starting authorize function');
        if (!credentials?.access_token) {
          logger.error('No access token provided');
          return null;
        }

        try {
          logger.log('Decoding token');
          const decodedToken = jwtDecode<DecodedToken>(credentials.access_token);
          logger.log('Decoded token:', JSON.stringify(decodedToken));

          // Validate the decoded token
          if (!decodedToken.email || !decodedToken.sub || !Array.isArray(decodedToken.roles)) {
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
            id: decodedToken.sub,
            name: decodedToken.email.split('@')[0], // You might want to adjust this
            email: decodedToken.email,
            accessToken: credentials.access_token,
            role: role,
          };
        } catch (error) {
          logger.error('Token decode error:', error);
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
      logger.log('Starting Google login...');
      try {
        if (account?.provider === 'google') {
          // Call your user service to check/create user and get role
          const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: account.id_token,
            }),
          });
          const data = await response.json();
          logger.log('Google Auth: ', JSON.stringify(data));

          if (response.ok) {
            user.role = data.roles[0];
            user.accessToken = data.access_token;
            user.image = profile?.image;
            logger.log('Google Auth USER: ', JSON.stringify(user));
            return true;
          } else {
            return '/auth/error';
          }
        }
        return true;
      } catch (error) {
        logger.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      logger.log('JWT Callback - Token:', JSON.stringify(token));
      logger.log('JWT Callback - User:', user ? JSON.stringify(user) : 'No user');
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      logger.log('Session Callback - Token:', JSON.stringify(token));
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        accessToken: token.accessToken as string,
        image: token.picture as string,
        role: token.role as Roles,
      };
      logger.log('Session Callback - Session:', JSON.stringify(session));
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Customize the redirect based on the user's role
      if (url.startsWith(baseUrl)) {
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

export async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();

  if (!session?.user?.accessToken) {
    logger.warn(errorMessages.UNAUTHORIZED);
    return {};
  }

  return { Authorization: `Bearer ${session.user.accessToken}` };
}

export async function getAuthState(): Promise<AuthState> {
  const session = await getSession();

  if (!session) return { isAuthenticated: false, user: null, role: [] };

  return {
    isAuthenticated: !!session.user?.accessToken,
    user: session.user || null,
    role: session.user ? [session.user.role] : [],
  };
}

export async function getRoles(): Promise<Roles[]> {
  const session = await getSession();
  return session?.user?.role ? [session.user.role] : [];
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const roles = await getRoles();

  if (!roles.length) return false;

  return roles.some(role => (rolePermissions as RolePermissions)[role][permission]);
}

export async function canAccessRoutes(route: string): Promise<boolean> {
  const roles = await getRoles();

  if (!roles.length) return false;

  return roles.some(role => authConfig.routes[role].includes(route));
}
