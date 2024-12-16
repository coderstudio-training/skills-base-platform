'use client';

import { NotificationCenter } from '@/components/Dashboard/components/Header/AdminNotifications';

export default function NotificationsPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <NotificationCenter
        onLastNotificationDateChange={function (date: string | null): void {
          throw new Error(`Function not implemented: ${date}`);
        }}
      />
    </div>
  );
}
