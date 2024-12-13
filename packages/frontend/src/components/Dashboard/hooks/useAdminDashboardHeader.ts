import { signOut } from 'next-auth/react';
import { useState } from 'react';

export function useAdminDashboardHeader() {
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

  return {
    lastSyncTime,
    handleLastNotificationDate,
    handleLogout,
  };
}
