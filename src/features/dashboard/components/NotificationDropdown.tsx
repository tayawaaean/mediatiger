import * as React from "react";
import { Bell, ArrowRight } from "lucide-react";
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
                                       viewAllPath = "/notifications" // Default path for notifications page
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
    setNotifications(safeNotifications.filter(n => n.id !== id));
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
              className="w-[380px] max-h-[85vh] overflow-hidden rounded-xl border border-slate-700/20 bg-slate-900/90 backdrop-blur-xl p-0 shadow-xl shadow-black/20 will-change-[transform,opacity] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              align="end"
              sideOffset={8}
              style={{ zIndex: 9999 }} // Very high z-index to ensure it's on top
          >
            {/* Header section */}
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

            {/* Content section */}
            <div className="max-h-[calc(85vh-7rem)] overflow-y-auto p-2">
              {hasNotifications ? (
                  <div className="py-2">
                    {Object.entries(groupedNotifications).map(([date, items]) => (
                        <div key={date} className="mb-4">
                          <div className="mb-1 px-1">
                            <h4 className="text-xs font-medium uppercase text-slate-500">{date}</h4>
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

// Example NotificationsPage component that would use getAllNotifications
/*
import React, { useEffect, useState } from 'react';
import { useNotifications, Notification, NotificationType } from '../../../hooks/useNotifications';
import { NotificationItem } from '../../../components/notification-item';
import { groupNotificationsByDate } from '../../../lib/notification-helpers';

export function NotificationsPage() {
  const { getAllNotifications, handleMarkAsRead, handleClearNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<NotificationType | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeRead, setIncludeRead] = useState(true);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const itemsPerPage = 10;

  // Fetch notifications when filters change
  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filterType, searchQuery, includeRead, fromDate, toDate]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await getAllNotifications({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        filterByType: filterType,
        searchQuery: searchQuery || undefined,
        includeRead: includeRead,
        fromDate: fromDate,
        toDate: toDate,
        sortOrder: 'desc'
      });

      setNotifications(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveNotification = (id: string) => {
    // Remove from list and refetch to keep counts accurate
    fetchNotifications();
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Filter by type</label>
            <select
              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value ? e.target.value as NotificationType : undefined)}
            >
              <option value="">All types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Status</label>
            <select
              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
              value={includeRead.toString()}
              onChange={(e) => setIncludeRead(e.target.value === 'true')}
            >
              <option value="true">All notifications</option>
              <option value="false">Unread only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 rounded bg-slate-800 text-white border border-slate-700"
              />
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>


</div>

{loading ? (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
      <p className="mt-2 text-slate-400">Loading notifications...</p>
    </div>
) : notifications.length === 0 ? (
    <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800/50">
      <div className="rounded-full bg-slate-800/50 p-4 mx-auto w-16 h-16 flex items-center justify-center">
        <Bell className="text-slate-400" size={24} />
      </div>
      <h2 className="mt-4 text-xl font-medium text-slate-300">No notifications found</h2>
      <p className="mt-2 text-slate-500">
        {searchQuery || filterType || !includeRead
            ? "Try adjusting your filters to see more results"
            : "You don't have any notifications yet"}
      </p>
    </div>
) : (
    <>
      <div className="space-y-4">
        {Object.entries(groupNotificationsByDate(notifications)).map(([date, items]) => (
            <div key={date} className="bg-slate-900/60 rounded-xl border border-slate-800/50 overflow-hidden">
              <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50">
                <h3 className="font-medium text-sm text-slate-400">{date}</h3>
              </div>
              <div className="divide-y divide-slate-800/50">
                {items.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleMarkAsRead}
                        onRemove={handleRemoveNotification}
                    />
                ))}
              </div>
            </div>
        ))}
      </div>

      {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>

              <span className="px-3 py-1 text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>

              <button
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
      )}
    </>
)}
</div>
);
}
*/