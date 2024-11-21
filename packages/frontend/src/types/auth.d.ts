export interface DecodedToken {
  email: string;
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface AuthResponse {
  id: string; // User ID (subject)
  name: string; // User's name (derived from email)
  email: string; // User email
  accessToken: string; // The access token
  role: 'admin' | 'manager' | 'staff'; // User role
}
