import { Roles } from '@/lib/api/types';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      accessToken: string;
      role: Roles;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    image?: string;
    role: Roles;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image?: string;
    accessToken: string;
    role: Roles;
  }
}
