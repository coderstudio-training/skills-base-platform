'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserData {
  designation: string;
  businessUnit: string;
}

export default function ManagerHeader() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/employees/email/${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            console.error('Failed to fetch employee data');
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
        }
      }
    };

    fetchEmployeeData();
  }, [session?.user?.email]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          {session?.user?.image ? (
            <AvatarImage
              src={session?.user?.image}
              alt={session?.user?.name}
              width={120}
              height={120}
              onError={e => {
                const imgElement = e.target as HTMLImageElement;
                imgElement.style.display = 'none';
              }}
            />
          ) : null}
          <AvatarFallback className="text-lg">{getInitials(session?.user?.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{session?.user?.name} (Manager)</h1>
          <p className="text-muted-foreground">
            {userData ? `${userData.designation} - ${userData.businessUnit}` : 'Loading...'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button>Team Settings</Button>
        <Button onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
