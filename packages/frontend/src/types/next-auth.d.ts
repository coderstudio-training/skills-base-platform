import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      accessToken: string;
      role: 'employee' | 'manager' | 'admin';
    }
  }

  interface User {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    role: 'employee' | 'manager' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    role: 'employee' | 'manager' | 'admin';
  }
}
