import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
}

let notifications: Notification[] = [];

export function createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const newNotification: Notification = {
    id: uuidv4(),
    ...data,
    createdAt: new Date(),
  };
  notifications.push(newNotification);
  return newNotification;
}

export function getNotifications(): Notification[] {
  return notifications;
}

export function clearNotification(id: string): void {
  notifications = notifications.filter(notification => notification.id !== id);
}
