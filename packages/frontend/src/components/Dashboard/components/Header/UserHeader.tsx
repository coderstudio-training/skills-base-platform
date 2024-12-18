import { useUserProfile } from '@/components/Dashboard/hooks/useUserProfile';
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
    <header className="overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
        {/* Left Section */}
        <div className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 text-center md:text-left">
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
            <h1 className="text-lg md:text-3xl font-bold">{fullName}</h1>
            <p className="text-sm md:text-md text-muted-foreground">
              {userProfile
                ? `${userProfile.designation} - ${userProfile.businessUnit}`
                : 'Loading...'}
            </p>
            <Badge className="mt-1">{userProfile ? userProfile.grade : 'Loading...'}</Badge>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-y-0 sm:space-x-4">
          <Button>{isManager ? 'Team Settings' : 'Update Profile'}</Button>
          <Button onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
