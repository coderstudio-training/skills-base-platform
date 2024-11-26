import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      accessToken: string;
      role: 'staff' | 'manager' | 'admin';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    image?: string;
    role: 'staff' | 'manager' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image?: string;
    accessToken: string;
    role: 'staff' | 'manager' | 'admin';
  }
}
