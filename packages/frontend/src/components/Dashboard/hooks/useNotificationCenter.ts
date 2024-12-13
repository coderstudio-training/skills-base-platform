import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, NotificationCenterProps } from '../types';

const SOCKET_URL = process.env.NEXT_PUBLIC_INTEGRATION_SERVICE_URL || 'http://localhost:3004';

export function useNotificationCenter({ onLastNotificationDateChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>(
    'disconnected',
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const mostRecentDate = notifications.length > 0 ? notifications[0].execution.startedAt : null;
    onLastNotificationDateChange?.(mostRecentDate);
  }, [notifications, onLastNotificationDateChange]);

  useEffect(() => {
    const socket: Socket = io(`${SOCKET_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const setupSocketListeners = () => {
      socket.on('connect', () => {
        console.log('Connected to notification service');
        setConnectionStatus('connected');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from notification service');
        setConnectionStatus('disconnected');
      });

      socket.on('notifications:init', (data: { notifications: Notification[] }) => {
        console.log('Initial notifications:', data);
        setNotifications(data.notifications);
      });

      socket.on('notification:new', (notification: Notification) => {
        console.log('New notification:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      socket.on('notification:updated', (updatedNotification: Notification) => {
        console.log('Updated notification:', updatedNotification);
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === updatedNotification._id ? updatedNotification : notification,
          ),
        );
      });
    };

    setupSocketListeners();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAsRead = useCallback(async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      console.log('Marking notification as read:', id);
      const response = await fetch(`${SOCKET_URL}/workflows/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const updatedNotification = await response.json();
      console.log('Successfully marked notification as read:', updatedNotification);

      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the mark as read action
    try {
      console.log('Deleting notification:', id);
      const response = await fetch(`${SOCKET_URL}/workflows/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      console.log('Successfully deleted notification:', id);
      setNotifications(prev => prev.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return {
    notifications,
    connectionStatus,
    unreadCount,
    handleMarkAsRead,
    handleDelete,
    formatTimestamp,
    getStatusVariant,
  };
}
