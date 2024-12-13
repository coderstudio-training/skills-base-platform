import { signOut } from 'next-auth/react';

export function useLogout() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return {
    handleLogout,
  };
}
