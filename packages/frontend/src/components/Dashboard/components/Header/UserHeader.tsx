'use client';
import ThemeChangeButton from '@/components/Dashboard/components/Buttons/ThemeChangeButton';
import { useDarkTheme } from '@/components/Dashboard/hooks/useDarkTheme';
import { useLogout } from '@/components/Dashboard/hooks/useLogout';
import { useUserProfile } from '@/components/Dashboard/hooks/useUserProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils/string-utils';
import { LogOut } from 'lucide-react';

export default function UserHeader() {
  const { userProfile, isManager, fullName } = useUserProfile();
  const { theme: preference, toggleTheme: handleThemeChange } = useDarkTheme();
  const { handleLogout } = useLogout();

  return (
    <header className="container mx-auto p-4 max-w-max md:max-w-[80%] overflow-x-hidden border-b sticky top-0 z-50 bg-background">
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
            ) : (
              // Move fallback outside conditional to avoid layout shift
              <AvatarFallback className="text-lg bg-primary/10">
                {getInitials(fullName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-lg md:text-3xl font-bold">{fullName}</h1>
            <p className="text-sm md:text-md text-muted-foreground">
              {userProfile
                ? `${userProfile.designation} - ${userProfile.businessUnit}`
                : 'Loading...'}
            </p>
            <Badge className="mt-1 bg-violet-500 dark:bg-violet-400 hover:bg-violet-500">
              {userProfile ? userProfile.grade : '...'}
            </Badge>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-y-0 sm:space-x-4">
          <ThemeChangeButton handleThemeChange={handleThemeChange} preference={preference} />
          <Button>{isManager ? 'Team Settings' : 'Update Profile'}</Button>
          <Button onClick={handleLogout} className="hover:bg-red-500 hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
