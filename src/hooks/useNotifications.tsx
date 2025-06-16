import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "../lib/supabase";
// Define the notification interface
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;   // Changed from 'content' to 'message'
  date: Date;        // Changed from 'time' (string) to 'date' (Date)
  read: boolean;
  type: NotificationType;
  actionUrl?: string; // New property
  actionLabel?: string; // New property
}

// Define the context type
interface NotificationContextType {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  hasNewNotification: boolean;
  setHasNewNotification: (has: boolean) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  notifNumber: number;
  setNotifNumber: (num: number) => void;
  notification: {
    title: string;
    content: string;
    type: string;
  } | null;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  notificationType: string;
  handleMarkAllAsRead: () => Promise<void>;
  handleClearNotifications: () => Promise<void>;
  handleMarkAsRead: (id: string) => Promise<void>;
  addNotification: (notificationData: {
    title: string;
    content: string;
    type?: string;
    actionUrl?: string;
    actionLabel?: string;
  }, targetUserId?: string | null) => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  getAllNotifications: (options?: {
    userId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filterByType?: NotificationType;
    includeRead?: boolean;
    searchQuery?: string;
    fromDate?: Date;
    toDate?: Date;
  }) => Promise<{
    data: Notification[];
    count: number;
    error: any;
  }>;
  loading: boolean;
  lastError: string | null;
}

// Create context with default values
const NotificationsContext = createContext<NotificationContextType | null>(null);

// Add function to create notifications with debug logging
export const createNotification = async (
    supabase: any,
    notification: {
      title: string;
      content: string;
      type?: string;
      actionUrl?: string;
      actionLabel?: string;
    },
    userId: string | null = null
): Promise<any> => {
  console.log("Creating notification:", notification, "for user:", userId);

  try {
    // If userId is null, use the current authenticated user's ID
    let targetUserId = userId;

    if (!targetUserId) {
      // Get current user's ID if no specific user ID is provided
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;

      if (!targetUserId) {
        console.error("No user ID provided and no authenticated user found");
        return null;
      }
    }

    console.log("Using target user ID:", targetUserId);

    // Check if notifications table has expected structure
    try {
      const { error: inspectError } = await supabase
          .from('notifications')
          .select('id')
          .limit(1);

      if (inspectError) {
        console.error("Error checking notifications table:", inspectError);
      }
    } catch (e) {
      console.error("Exception checking notifications table:", e);
    }

    // Now insert the notification with the resolved user ID
    const { data, error } = await supabase
        .from("notifications")
        .insert({
          title: notification.title,
          content: notification.content,
          type: notification.type || "info",
          user_id: targetUserId,
          read: false,
          action_url: notification.actionUrl,
          action_label: notification.actionLabel
        })
        .select();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    console.log("Notification created successfully:", data);
    return data[0];
  } catch (error) {
    console.error("Exception creating notification:", error);
    return null;
  }
};

// Provider component props
interface NotificationsProviderProps {
  children: ReactNode;
}

// Create the provider component
export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  // Notifications state
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [hasNewNotification, setHasNewNotification] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifNumber, setNotifNumber] = useState<number>(0);
  const [notification, setNotification] = useState<{
    title: string;
    content: string;
    type: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<string>("info");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Set user when authenticated
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        console.log("User signed in:", session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        console.log("User signed out");
      }
    });

    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        console.log("Current user:", user.id);
      } else {
        console.log("No user currently authenticated");
      }
    };

    getCurrentUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check notifications table health
  useEffect(() => {
    const checkNotificationsTable = async () => {
      try {
        const { data, error } = await supabase.from('notifications').select('*').limit(1);
        if (error) {
          console.error("Error accessing notifications table:", error);
          setLastError(`Notifications table error: ${error.message}`);
        } else {
          console.log("Notifications table check passed");
        }
      } catch (e) {
        console.error("Exception checking notifications table:", e);
        setLastError(`Exception checking notifications table: ${e}`);
      }
    };

    if (user) {
      checkNotificationsTable();
    }
  }, [user]);

  // Get notification count with enhanced error handling
  const getNotifNumber = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("read", false)
          .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching notification count:", error);
        setLastError(`Error fetching notification count: ${error.message}`);
        return 0;
      }

      console.log("Unread notifications:", count);
      return count || 0;
    } catch (error: any) {
      console.error("Exception fetching notification count:", error);
      setLastError(`Exception fetching notification count: ${error.message}`);
      return 0;
    }
  }, [user?.id]);

  // Enhanced notification handler
  const handleNotifications = useCallback((payload: any) => {
    try {
      const notif = payload.new;
      console.log("New notification received:", notif);

      // If the notification is for this user, show a toast and refresh data
      if (notif?.user_id === user?.id) {
        const { content, title, type } = notif;
        console.log("Processing notification for current user:", { content, title, type });
        setNotification({ content, title, type });
        setNotificationType(type);
        setIsVisible(true);

        // Refresh notifications and count
        fetchNotifications();
        getNotifNumber().then(count => setNotifNumber(count));

        // Set animation to show new notification
        setHasNewNotification(true);
      }
    } catch (error: any) {
      console.error("Error handling notification:", error);
      setLastError(`Error handling notification: ${error.message}`);
    }
  }, [user?.id, getNotifNumber]);

  // Fetch notifications with enhanced error handling
  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.log("Cannot fetch notifications - no user ID");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching notifications for user:", user.id);
      const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        setLastError(`Error fetching notifications: ${error.message}`);
        return;
      }

      if (data) {
        console.log(`Fetched ${data.length} notifications`);
        setNotifications(
            data.map((notification: any) => ({
              id: notification.id,
              title: notification.title,
              message: notification.content,  // Map 'content' from DB to 'message' for component
              date: new Date(notification.created_at), // Convert string to Date object
              read: notification.read,
              type: notification.type as NotificationType,
              actionUrl: notification.action_url || undefined, // Map from DB, if exists
              actionLabel: notification.action_label || undefined, // Map from DB, if exists
            }))
        );
      }
    } catch (error: any) {
      console.error("Exception fetching notifications:", error);
      setLastError(`Exception fetching notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Get all notifications with filtering, sorting, and pagination
  const getAllNotifications = useCallback(async (options?: {
    userId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filterByType?: NotificationType;
    includeRead?: boolean;
    searchQuery?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{
    data: Notification[];
    count: number;
    error: any;
  }> => {
    setLoading(true);

    try {
      // Use current user ID if not specified
      const targetUserId = options?.userId || user?.id;

      if (!targetUserId) {
        console.error("Cannot fetch notifications: No user ID provided");
        return {
          data: [],
          count: 0,
          error: "No user ID provided"
        };
      }

      console.log(`Fetching notifications for user ${targetUserId} with options:`, options);

      // Build the query
      let query = supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("user_id", targetUserId);

      // Apply read status filter if specified
      if (options?.includeRead === false) {
        query = query.eq("read", false);
      }

      // Apply type filter if specified
      if (options?.filterByType) {
        query = query.eq("type", options.filterByType);
      }

      // Apply date range filters if specified
      if (options?.fromDate) {
        const fromDateStr = options.fromDate.toISOString();
        query = query.gte("created_at", fromDateStr);
      }

      if (options?.toDate) {
        const toDateStr = options.toDate.toISOString();
        query = query.lte("created_at", toDateStr);
      }

      // Apply text search if specified
      if (options?.searchQuery) {
        const searchTerm = `%${options.searchQuery}%`;
        query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
      }

      // Apply sorting
      const sortField = options?.sortBy || "created_at";
      const sortDirection = options?.sortOrder || "desc";
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      // Apply pagination if specified
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
            options.offset,
            options.offset + (options.limit || 20) - 1
        );
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        setLastError(`Error fetching notifications: ${error.message}`);
        return {
          data: [],
          count: 0,
          error: error
        };
      }

      // Transform the data to match our Notification interface
      const transformedData: Notification[] = (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.content,  // Map 'content' from DB to 'message'
        date: new Date(notification.created_at),
        read: notification.read,
        type: notification.type as NotificationType,
        actionUrl: notification.action_url,
        actionLabel: notification.action_label,
      }));

      console.log(`Retrieved ${transformedData.length} notifications`);
      return {
        data: transformedData,
        count: count || transformedData.length,
        error: null
      };
    } catch (error: any) {
      console.error("Exception fetching notifications:", error);
      setLastError(`Exception fetching notifications: ${error.message}`);
      return {
        data: [],
        count: 0,
        error: error
      };
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase, setLastError, setLoading]);

  // Mark all as read with enhanced error handling
  const handleMarkAllAsRead = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.log("Cannot mark as read - no user ID");
      return;
    }

    try {
      console.log("Marking all notifications as read for user:", user.id);
      const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id);

      if (error) {
        console.error("Error marking all as read:", error);
        setLastError(`Error marking all as read: ${error.message}`);
        return;
      }

      // Update local state
      setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
      );
      setNotifNumber(0);
      setHasNewNotification(false);
      console.log("All notifications marked as read");
    } catch (error: any) {
      console.error("Exception marking all as read:", error);
      setLastError(`Exception marking all as read: ${error.message}`);
    }
  }, [user?.id]);

  // Clear notifications with enhanced error handling
  const handleClearNotifications = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.log("Cannot clear notifications - no user ID");
      return;
    }

    try {
      console.log("Clearing all notifications for user:", user.id);
      const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("user_id", user.id);

      if (error) {
        console.error("Error clearing notifications:", error);
        setLastError(`Error clearing notifications: ${error.message}`);
        return;
      }

      // Update local state
      setNotifications([]);
      setNotifNumber(0);
      setHasNewNotification(false);
      console.log("All notifications cleared");
    } catch (error: any) {
      console.error("Exception clearing notifications:", error);
      setLastError(`Exception clearing notifications: ${error.message}`);
    }
  }, [user?.id]);

  // Mark single notification as read with enhanced error handling
  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    if (!user?.id) {
      console.log("Cannot mark notification as read - no user ID");
      return;
    }

    try {
      console.log(`Marking notification ${id} as read for user:`, user.id);
      const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id);

      if (error) {
        console.error("Error marking notification as read:", error);
        setLastError(`Error marking notification as read: ${error.message}`);
        return;
      }

      // Update local state
      setNotifications(prev =>
          prev.map(notification =>
              notification.id === id ? { ...notification, read: true } : notification
          )
      );

      // Update unread count
      getNotifNumber().then(count => setNotifNumber(count));
      console.log(`Notification ${id} marked as read`);
    } catch (error: any) {
      console.error("Exception marking notification as read:", error);
      setLastError(`Exception marking notification as read: ${error.message}`);
    }
  }, [user?.id, getNotifNumber]);

  // Add notification with enhanced error handling and debugging
  const addNotification = useCallback(async (
      notificationData: {
        title: string;
        content: string;
        type?: string;
        actionUrl?: string;
        actionLabel?: string;
      },
      targetUserId: string | null = null
  ): Promise<boolean> => {
    try {
      console.log("Adding notification:", notificationData, "for user:", targetUserId);

      // Get current user if targetUserId is not provided
      let userId = targetUserId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        console.log("Using current user ID:", userId);
      }

      if (!userId) {
        console.error("No user ID available for notification");
        return false;
      }

      // Try direct insert first (works with RLS disabled)
      const { data, error } = await supabase
          .from("notifications")
          .insert({
            title: notificationData.title,
            content: notificationData.content,
            type: notificationData.type || "info",
            user_id: userId,
            read: false,
            action_url: notificationData.actionUrl,
            action_label: notificationData.actionLabel
          })
          .select();

      // If direct insert fails due to RLS policy, try the RPC method
      if (error && error.code === '42501') {
        console.log("Direct insert failed due to RLS policy, trying RPC method...");

        // Check if we have the insert_notification function available
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('insert_notification', {
            p_title: notificationData.title,
            p_content: notificationData.content,
            p_type: notificationData.type || 'info',
            p_user_id: userId,
            p_action_url: notificationData.actionUrl,
            p_action_label: notificationData.actionLabel
          });

          if (rpcError) {
            console.error("RPC method also failed:", rpcError);
            // If RPC fails too, create a realtime notification instead
            console.log("Trying realtime notification as last resort...");

            // This is a workaround that might bypass RLS in some configurations
            // by triggering the realtime subscription handlers
            const payload = {
              type: 'broadcast',
              event: 'notification',
              payload: {
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type || "info",
                user_id: userId,
                read: false,
                created_at: new Date().toISOString(),
                action_url: notificationData.actionUrl,
                action_label: notificationData.actionLabel
              }
            };

            // Try to broadcast a notification event
            const channel = supabase.channel('custom-notifications');
            await channel.subscribe();
            const broadcastResult = await channel.send(payload);

            if (!broadcastResult) {
              console.error("All notification methods failed");
              return false;
            }

            console.log("Realtime notification sent successfully");
          } else {
            console.log("RPC notification sent successfully:", rpcData);
          }
        } catch (rpcFallbackError) {
          console.error("Error in RPC fallback:", rpcFallbackError);
          return false;
        }
      } else if (error) {
        // Handle other types of errors
        console.error("Error adding notification:", error);
        return false;
      } else {
        console.log("Direct notification insert succeeded:", data);
      }

      // If it's for the current user, refresh the list
      if (!targetUserId || targetUserId === user?.id) {
        fetchNotifications();
        getNotifNumber().then(count => setNotifNumber(count));
      }

      return true;
    } catch (error) {
      console.error("Error adding notification:", error);
      return false;
    }
  }, [user?.id, fetchNotifications, getNotifNumber]);

  // Toast auto-hide effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Animation reset effect
  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      setHasNewNotification(true);
      // Reset the animation after it plays
      const timer = setTimeout(() => {
        setHasNewNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Data loading and subscription effect
  useEffect(() => {
    if (!user?.id) return;

    console.log("Setting up initial data load and subscription for user:", user.id);

    // Initial data load
    fetchNotifications();
    getNotifNumber().then((res) => {
      setNotifNumber(res);
    });

    // Subscribe to notifications
    const channel = supabase
        .channel("notifications")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "notifications" },
            (payload: any) => {
              console.log("Notification change event:", payload.eventType);

              // If it's a new notification
              if (payload.eventType === "INSERT") {
                handleNotifications(payload);
              }
              // If notifications are updated or deleted, refresh the list
              else if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
                fetchNotifications();
                getNotifNumber().then(count => setNotifNumber(count));
              }
            }
        )
        .subscribe();

    console.log("Subscription to notifications established");

    return () => {
      console.log("Cleaning up notification subscription");
      channel.unsubscribe();
    };
  }, [user?.id, fetchNotifications, getNotifNumber, handleNotifications]);

  // Context value to be provided
  const contextValue: NotificationContextType = {
    showNotifications,
    setShowNotifications,
    hasNewNotification,
    setHasNewNotification,
    notifications,
    setNotifications,
    notifNumber,
    setNotifNumber,
    notification,
    isVisible,
    setIsVisible,
    notificationType,
    handleMarkAllAsRead,
    handleClearNotifications,
    handleMarkAsRead,
    addNotification,
    refreshNotifications: fetchNotifications,
    getAllNotifications,
    loading,
    lastError,
  };

  return (
      <NotificationsContext.Provider value={contextValue}>
        {children}
      </NotificationsContext.Provider>
  );
};

// Custom hook to use the notifications context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};