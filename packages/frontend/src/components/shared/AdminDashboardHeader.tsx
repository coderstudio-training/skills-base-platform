'use client';

import { NotificationCenter } from '@/components/NotificationCenter';
import { ReportGenerator } from '@/components/ReportGenerator';
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
import { Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function AdminDashboardHeader() {
  const [lastSyncTime, setLastSyncTime] = useState('No sync data');

  const handleLastNotificationDate = (date: string | null) => {
    if (date) {
      const formattedDate = new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      setLastSyncTime(`Last synced: ${formattedDate}`);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b">
      <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <Badge variant="secondary">{lastSyncTime}</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <ReportGenerator />
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
