import { format } from "date-fns";
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Notification, NotificationType } from "../hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onRemove,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank");
    }
  };

  console.log(notification);
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg p-3 transition-all",
        notification.read
          ? "bg-transparent hover:bg-slate-800/40"
          : "bg-slate-800/40 hover:bg-slate-800/60"
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        {notification.read}
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 cursor-pointer" onClick={handleClick}>
        <div className="flex items-center justify-between">
          <h4
            className={cn(
              "text-sm font-medium",
              notification.read ? "text-slate-200" : "text-white"
            )}
          >
            {notification.title}
          </h4>
          <span className="text-xs text-slate-400">
            {formatNotificationDate(notification.date)}
          </span>
        </div>
        {notification.read ? (
          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
        ) : (
          <p className="mt-1 text-sm font-bold text-slate-800">
            {notification.message}
          </p>
        )}
        {notification.actionLabel && (
          <button
            className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {notification.actionLabel}
          </button>
        )}
        {!notification.read && (
          <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500" />
        )}
      </div>
      <button
        className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-slate-300 focus:opacity-100 focus:outline-none"
        onClick={() => onRemove(notification.id)}
        aria-label="Remove notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const iconProps = {
    size: 18,
    className: cn(
      "rounded-full p-0.5",
      type === "info" && "text-blue-400 bg-blue-400/10",
      type === "success" && "text-emerald-400 bg-emerald-400/10",
      type === "warning" && "text-amber-400 bg-amber-400/10",
      type === "error" && "text-rose-400 bg-rose-400/10"
    ),
  };

  switch (type) {
    case "info":
      return <Info {...iconProps} />;
    case "success":
      return <CheckCircle {...iconProps} />;
    case "warning":
      return <AlertTriangle {...iconProps} />;
    case "error":
      return <AlertCircle {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
}

function formatNotificationDate(date: Date): string {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  if (date >= todayStart) {
    return format(date, "h:mm a");
  } else if (date >= yesterdayStart) {
    return "Yesterday";
  } else {
    return format(date, "MMM d");
  }
}
