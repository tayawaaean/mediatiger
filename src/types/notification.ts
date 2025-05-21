export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export interface NotificationHandlers {
  setHasNewNotification: (value: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  setNotifNumber: (value: number) => void;
}