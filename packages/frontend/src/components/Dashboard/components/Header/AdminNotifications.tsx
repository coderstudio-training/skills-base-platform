import { useNotificationCenter } from '@/components/Dashboard/hooks/useNotificationCenter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Circle } from 'lucide-react';

export function NotificationCenter({
  onLastNotificationDateChange,
}: {
  onLastNotificationDateChange: (date: string | null) => void;
}) {
  const {
    notifications,
    connectionStatus,
    unreadCount,
    handleMarkAsRead,
    handleDelete,
    formatTimestamp,
    getStatusVariant,
  } = useNotificationCenter({ onLastNotificationDateChange });

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative hover:text-blue-400 dark:hover:text-blue-600"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
            Notifications{' '}
            {connectionStatus === 'connected' ? (
              <span className="text-xs text-green-500">•</span>
            ) : (
              <span className="text-xs text-red-500">•</span>
            )}
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            ) : (
              notifications.map(notification => (
                <DropdownMenuItem
                  key={notification._id}
                  className={`flex flex-col items-start p-4 cursor-pointer relative border-b last:border-b-0 ${
                    !notification.read ? 'bg-slate-50' : ''
                  }`}
                  onClick={e => handleMarkAsRead(notification._id, e)}
                >
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Circle className="h-2 w-2 flex-shrink-0 fill-red-500 text-red-500" />
                    )}
                    <div className="font-semibold">{notification.workflow.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Status:{' '}
                    <span className={getStatusVariant(notification.execution.status)}>
                      {notification.execution.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-gray-400 mt-2">
                      {formatTimestamp(notification.execution.startedAt)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => handleDelete(notification._id, e)}
                      className="h-6 px-2 text-sm hover:bg-red-500 hover:text-white"
                    >
                      Clear
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
