import { useUserProfile } from '@/blocks/Dashboard/hooks/useUserProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils/string-utils';
import { LogOut } from 'lucide-react';
import { useLogout } from '../../hooks/useLogout';

export function UserHeader() {
  const { userProfile, isManager, fullName } = useUserProfile();

  const { handleLogout } = useLogout();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          {userProfile?.picture ? (
            <AvatarImage
              src={userProfile.picture}
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
        <Button>{isManager ? 'Team Settings' : 'Update Profile'}</Button>
        <Button onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
