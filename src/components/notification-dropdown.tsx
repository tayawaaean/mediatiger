// NotificationDropdown.tsx (fixed)
import * as React from "react";
import { Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { NotificationBadge } from "./ui/notification-badge";
import { NotificationItem } from "./notification-item";
import { groupNotificationsByDate } from "../lib/notification-helpers";
import { useNotifications } from "../hooks/useNotifications";
import { cn } from "../lib/utils";

interface NotificationDropdownProps {
  triggerClassName?: string;
}

export function NotificationDropdown({ triggerClassName }: NotificationDropdownProps) {
  const {
    notifications,
    notifNumber,  // This is your unread count from the hook
    handleMarkAsRead: markAsRead,
    handleMarkAllAsRead: markAllAsRead,
    handleClearNotifications: clearAll,
    setNotifications
  } = useNotifications();

  const [open, setOpen] = React.useState(false);
  const groupedNotifications = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;

  // Close dropdown when escape key is pressed
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Function to handle removing a notification
  const removeNotification = async (id: string) => {
    // Remove it from state directly
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
              className={cn(
                  "relative rounded-full p-2 text-slate-300 transition-all hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900",
                  triggerClassName
              )}
              aria-label="Open notifications"
          >
            <Bell size={20} />
            {notifNumber > 0 && (
                <NotificationBadge
                    count={notifNumber}
                    className="absolute -right-0.5 -top-0.5"
                />
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
              className="w-[380px] max-h-[85vh] overflow-hidden rounded-xl border border-slate-700/20 bg-slate-900/40 backdrop-blur-xl p-0 shadow-xl shadow-black/20 will-change-[transform,opacity] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              align="end"
              sideOffset={8}
          >
            <div className="flex items-center justify-between border-b border-slate-700/20 px-4 py-3">
              <h3 className="text-lg font-medium text-white">Notifications</h3>
              <div className="flex gap-2">
                {hasNotifications && (
                    <>
                      <button
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                          onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                      <div className="text-slate-700">|</div>
                      <button
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                          onClick={clearAll}
                      >
                        Clear all
                      </button>
                    </>
                )}
              </div>
            </div>

            <div className="max-h-[calc(85vh-3.5rem)] overflow-y-auto">
              {hasNotifications ? (
                  <div className="py-2">
                    {Object.entries(groupedNotifications).map(([date, items]) => (
                        <div key={date} className="px-3">
                          <div className="mb-1 mt-2 px-1">
                            <h4 className="text-xs font-medium uppercase text-slate-500">{date}</h4>
                          </div>
                          <div className="space-y-1">
                            {items.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                    onRemove={removeNotification}
                                />
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-slate-800/50 p-3">
                      <Bell className="text-slate-400" size={24} />
                    </div>
                    <h4 className="mt-4 text-base font-medium text-slate-300">No notifications</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      We'll notify you when something arrives
                    </p>
                  </div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
  );
}