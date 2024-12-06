'use client';
import { Badge } from '@/blocks/ui/badge';
import { Button } from '@/blocks/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/blocks/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import { useAdminDashboardHeader } from '../../hooks/useAdminDashboardHeader';
import { ReportManager } from '../Reports/ReportManager';
import { NotificationCenter } from './AdminNotifications';
export default function AdminDashboardHeader() {
  const { lastSyncTime, handleLastNotificationDate, handleLogout } = useAdminDashboardHeader();

  return (
    <header className="bg-white border-b">
      <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard v2</h1>
          <Badge variant="secondary">{lastSyncTime}</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <ReportManager />
          <NotificationCenter onLastNotificationDateChange={handleLastNotificationDate} />
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
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
