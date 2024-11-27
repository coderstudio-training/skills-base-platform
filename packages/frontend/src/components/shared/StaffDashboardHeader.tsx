import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  designation: string;
  businessUnit: string;
  grade: string;
  picture?: string;
}

export default function StaffDashboardHeader() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.email) {
        try {
          // Fetch user profile
          const response = await fetch('/api/users/profile');
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data);
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.email]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...';

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          {session?.user?.image ? (
            <AvatarImage
              src={userProfile?.picture}
              alt={fullName}
              width={120}
              height={120}
              onError={e => {
                const imgElement = e.target as HTMLImageElement;
                imgElement.style.display = 'none';
              }}
            />
          ) : null}
          <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground">
            {userProfile
              ? `${userProfile.designation} - ${userProfile.businessUnit}`
              : 'Loading...'}
          </p>
          <Badge className="mt-1">{userProfile ? userProfile.grade : 'Loading...'}</Badge>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button>Update Profile</Button>
        <Button onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
