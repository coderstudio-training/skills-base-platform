export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  perms: number[];
  iss?: string;
  aud?: string;
  exp?: number;
}
