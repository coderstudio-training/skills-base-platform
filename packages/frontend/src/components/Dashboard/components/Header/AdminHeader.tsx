'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { useAdminDashboardHeader } from '../../hooks/useAdminDashboardHeader';
import useDarkTheme from '../../hooks/useDarkTheme';
import { useLogout } from '../../hooks/useLogout';
import { ReportManager } from '../Reports/ReportManager';
import { NotificationCenter } from './AdminNotifications';
export default function AdminDashboardHeader() {
  const { lastSyncTime, handleLastNotificationDate } = useAdminDashboardHeader();
  const { preference, handleThemeChange } = useDarkTheme();
  const { handleLogout } = useLogout();

  return (
    <header className="bg-background border-b w-screen overflow-x-hidden">
      <div className="h-auto sm:h-16 max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Left section */}
        <div className="flex flex-col p-1 sm:p-0 sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
            Admin Dashboard
          </h1>
          <Badge variant="secondary">{lastSyncTime}</Badge>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 p-2 sm:p-0 sm:space-x-4">
          <ReportManager />
          <NotificationCenter onLastNotificationDateChange={handleLastNotificationDate} />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeChange}
            className="dark:hover:bg-slate-600 dark:bg-slate transition-colors duration-200 relative"
          >
            {preference === 'dark' ? (
              <Moon className="h-5 w-5 animate-scaleIn absolute" />
            ) : (
              <Sun className="h-5 w-5 animate-scaleIn absolute" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">{`AD`}</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin User</DropdownMenuLabel>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
