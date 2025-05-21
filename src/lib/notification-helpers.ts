import { Notification } from "@/hooks/use-notifications";

interface GroupedNotifications {
  [key: string]: Notification[];
}

export function groupNotificationsByDate(notifications: Notification[]): GroupedNotifications {
  const groups: GroupedNotifications = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  notifications.forEach((notification) => {
    if (notification.date >= todayStart) {
      groups.Today.push(notification);
    } else if (notification.date >= yesterdayStart) {
      groups.Yesterday.push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}