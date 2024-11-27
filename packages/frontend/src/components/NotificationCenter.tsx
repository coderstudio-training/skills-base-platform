'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification, clearNotification } from '@/lib/notifications';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate receiving new notifications
    const interval = setInterval(() => {
      setNotifications(prev => {
        if (prev.length >= 5) {
          clearInterval(interval);
          return prev;
        }
        const newNotification: Notification = {
          id: uuidv4(),
          title: `New Notification ${prev.length + 1}`,
          message: `This is notification number ${prev.length + 1}`,
          type: 'info',
          createdAt: new Date(),
        };
        return [...prev, newNotification];
      });
    }, 10000); // Add a new notification every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClearNotification = (id: string) => {
    clearNotification(id);
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        ) : (
          notifications.map(notification => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start">
              <div className="font-semibold">{notification.title}</div>
              <div className="text-sm text-gray-500">{notification.message}</div>
              <div className="flex justify-between items-center w-full mt-2">
                <span className="text-xs text-gray-400">
                  {notification.createdAt.toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearNotification(notification.id)}
                >
                  Clear
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
