import * as React from "react";
import { Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { NotificationBadge } from "../../../components/ui/notification-badge";
import { NotificationItem } from "../../../components/notification-item";
import { groupNotificationsByDate } from "../../../lib/notification-helpers";
import { useNotifications } from "../../../hooks/useNotifications";
import { cn } from "../../../lib/utils";

interface NotificationDropdownProps {
  triggerClassName?: string;
  viewAllPath?: string; // Optional custom path for "View All" link
}

export function NotificationDropdown({
  triggerClassName,
  viewAllPath = "/notifications", // Default path for notifications page
}: NotificationDropdownProps) {
  const {
    notifications,
    notifNumber,
    handleMarkAsRead: markAsRead,
    handleMarkAllAsRead: markAllAsRead,
    handleClearNotifications: clearAll,
    setNotifications,
    getAllNotifications, // Using the new function
  } = useNotifications();

  const [open, setOpen] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);

  // Make sure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Safely create grouped notifications
  const groupedNotifications = React.useMemo(() => {
    try {
      return groupNotificationsByDate(safeNotifications);
    } catch (error) {
      console.error("Error grouping notifications:", error);
      return {};
    }
  }, [safeNotifications]);

  const hasNotifications = safeNotifications.length > 0;

  // Get total notification count when dropdown opens
  React.useEffect(() => {
    if (open) {
      const fetchTotalCount = async () => {
        try {
          const result = await getAllNotifications({
            limit: 1, // Just need count, not actual data
          });
          setTotalCount(result.count);
        } catch (error) {
          console.error("Error fetching notification count:", error);
        }
      };

      fetchTotalCount();
    }
  }, [open, getAllNotifications]);

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
    setNotifications(safeNotifications.filter((n) => n.id !== id));
  };

  // Navigate to all notifications page
  const handleViewAll = () => {
    setOpen(false); // Close the dropdown
    window.location.href = viewAllPath; // Standard navigation
  };

  // Debug log
  React.useEffect(() => {
    if (open) {
      console.log("Notification dropdown opened");
      console.log("Notifications:", safeNotifications);
      console.log("Grouped notifications:", groupedNotifications);
      console.log("Has notifications:", hasNotifications);
    }
  }, [open, safeNotifications, groupedNotifications, hasNotifications]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "relative rounded-full p-2 text-slate-300 transition-all hover:bg-slate-800 hover:text-white focus:outline-none",
            triggerClassName
          )}
          aria-label="Open notifications"
        >
          <Bell size={30} />
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
          // className="w-[380px] max-h-[85vh] overflow-hidden rounded-xl border border-slate-700/20 bg-slate-900/90 backdrop-blur-xl p-0 shadow-xl shadow-black/20 will-change-[transform,opacity] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          className="bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700/50 w-[380px] mx-auto overflow-hidden transition-all duration-300 ease-in-out"
          align="end"
          sideOffset={8}
          style={{ zIndex: 9999 }} // Very high z-index to ensure it's on top
        >
          {/* Header section */}
          <div className="flex items-center justify-between border-b border-slate-700/20 px-4 py-3">
            {/* <h3 className="text-lg font-medium text-white">Notifications</h3> */}
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/20">
                <Bell size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Notification
              </h1>
            </div>
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

          {/* Content section */}
          <div className="max-h-[calc(85vh-7rem)] overflow-y-auto p-2">
            {hasNotifications ? (
              <div className="py-2">
                {Object.entries(groupedNotifications).map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <div className="mb-1 px-1">
                      <h4 className="text-xs font-medium uppercase text-slate-500">
                        {date}
                      </h4>
                    </div>
                    <div className="space-y-2">
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
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-slate-800/50 p-3">
                  <Bell className="text-slate-400" size={24} />
                </div>
                <h4 className="mt-4 text-base font-medium text-slate-300">
                  No notifications
                </h4>
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
