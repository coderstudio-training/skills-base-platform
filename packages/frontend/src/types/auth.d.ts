import { Roles } from '@/lib/api/types';

export interface DecodedToken {
  email: string;
  userId: string;
  roles: string[];
  perms: number[];
  iat: number;
  exp: number;
}

export interface AuthResponse {
  id: string; // User ID (subject)
  name: string; // User's name (derived from email)
  email: string; // User email
  accessToken: string; // The access token
  role: Roles; // User role
  perms: number[]; // User permissions
}
