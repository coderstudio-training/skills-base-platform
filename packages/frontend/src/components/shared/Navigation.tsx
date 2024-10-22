'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        {session?.user.role === 'staff' && (
          <li>
            <Link href="/dashboard/staff">Staff Dashboard</Link>
          </li>
        )}
        {session?.user.role === 'manager' && (
          <li>
            <Link href="/dashboard/manager">Manager Dashboard</Link>
          </li>
        )}
        {session?.user.role === 'admin' && (
          <li>
            <Link href="/dashboard/admin">Admin Dashboard</Link>
          </li>
        )}
        {session ? (
          <li>
            <button onClick={() => signOut()}>Sign out</button>
          </li>
        ) : (
          <li>
            <Link href="/auth/login">Sign in</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
