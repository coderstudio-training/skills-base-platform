import { useState } from 'react';
import useDarkTheme from './useDarkTheme';

export function useAdminDashboardHeader() {
  const [lastSyncTime, setLastSyncTime] = useState('No sync data');
  const [preference, setTheme] = useDarkTheme();

  const handleThemeChange = () => {
    setTheme(preference);
  };
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

  return {
    lastSyncTime,
    handleLastNotificationDate,
    handleThemeChange,
    preference,
  };
}
