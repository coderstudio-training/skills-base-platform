export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  perms: number[];
  iss?: string;
  aud?: string;
  exp?: number;
}
