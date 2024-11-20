'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function ManagerHeader() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={session?.user?.image || ''}
            alt={session?.user?.name || ''}
            width={120}
            height={120}
          />
          {session?.user?.name
            .split(' ')
            .map(n => n[0])
            .join('')}
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
          <p className="text-muted-foreground">
            {session?.user?.role} - {'Software Services'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button>Team Settings</Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
