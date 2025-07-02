import { Menu, MessageSquare, Settings } from "lucide-react";
import { SettingsDropdown } from "../../../components/SettingsDropdown";
import { supabase } from "../../../lib/supabase";
import { Notification } from "../../../types/notification";
import { ExtendedUser } from "../../../types/user";
import { handleSignOut } from "../../../utils/auth";
import { NotificationDropdown } from "./NotificationDropdown";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useRef, useEffect } from "react";

interface DashboardHeaderProps {
  activeSection: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (value: boolean) => void;
  showSettings: boolean;
  setShowSettings: (value: boolean) => void;
  hasUnreadMessages: boolean;
  setShowMessage: (value: boolean) => void;
  notifications: Notification[];
  notifNumber: number;
  user: ExtendedUser | null;
  signOut: () => void;
  isRejected: boolean;
  handleMarkAllAsRead: () => void;
  handleClearNotifications: () => void;
  setHasNewNotification: (value: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  setNotifNumber: (value: number) => void;
  handleUnreadMessages: () => void;
}

export function DashboardHeader({
  activeSection,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  showNotifications,
  setShowNotifications,
  showSettings,
  setShowSettings,
  hasUnreadMessages,
  setShowMessage,
  notifications,
  notifNumber,
  user,
  signOut,
  isRejected,
  handleMarkAllAsRead,
  handleClearNotifications,
  setHasNewNotification,
  setNotifications,
  setNotifNumber,
  handleUnreadMessages,
}: DashboardHeaderProps) {
  const { translate } = useLanguage();
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const messageButtonRef = useRef<HTMLButtonElement>(null);

  // Function to remove zoom effects
  const removeZoomEffects = (element: HTMLElement | null) => {
    if (!element) return;

    // Remove zoom classes and add override styles
    element.classList.remove("hover:scale-110", "transition-all");
    element.classList.add("transition-colors");
    element.style.transform = "none";
    element.style.transition = "background-color 0.2s, color 0.2s";

    // Apply to all children
    const children = element.querySelectorAll("*");
    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        child.classList.remove("hover:scale-110", "transition-all");
        child.classList.add("transition-colors");
        child.style.transform = "none";
        child.style.transition = "background-color 0.2s, color 0.2s";
      }
    });
  };

  // Apply the fix when the component mounts and if the elements change
  useEffect(() => {
    removeZoomEffects(settingsButtonRef.current);
    removeZoomEffects(messageButtonRef.current);

    // Apply again after a small delay
    const timeout = setTimeout(() => {
      removeZoomEffects(settingsButtonRef.current);
      removeZoomEffects(messageButtonRef.current);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return translate("dashboard.section.overview");
      case "channels":
        return translate("dashboard.section.channels");
      case "analytics":
        return translate("dashboard.section.analytics");
      case "rights":
        return translate("dashboard.section.rights");
      case "music":
        return translate("dashboard.section.music");
      case "balance":
        return translate("dashboard.section.balance");
      case "guides":
        return translate("dashboard.section.guides");
      default:
        return translate("dashboard.section.globalDistribution");
    }
  };

  // Prevent event propagation
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Define a consistent icon size
  const iconSize = 30;
  const iconClass = "text-slate-400 transition-colors duration-200";

  return (
    <div className="flex items-center justify-between w-full p-4 mb-6 rounded-lg">
      <h1
        onMouseEnter={() => {
          setShowNotifications(false);
          setShowSettings(false);
        }}
        className="text-2xl font-semibold text-white"
      >
        {getSectionTitle()}
      </h1>

      {/* Top Right Icons */}
      <div className="flex items-center gap-2 relative ">
        <div className="icon-container">
          <NotificationDropdown
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            notifNumber={notifNumber}
            supabase={supabase}
            userId={user?.id}
            setShowSettings={setShowSettings}
            setHasNewNotification={setHasNewNotification}
            setNotifications={setNotifications}
            setNotifNumber={setNotifNumber}
            markAllAsRead={(supabase, userId, handlers) => {
              handleMarkAllAsRead();
            }}
            clearNotifications={(supabase, userId, handlers) => {
              handleClearNotifications();
            }}
            triggerClassName="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
          />
        </div>
        <br />
        <div
          ref={settingsButtonRef}
          className="settings-button p-2 rounded-full text-slate-400 hover:bg-slate-700/50 transition-colors duration-200"
          onClick={() => {
            setShowSettings(!showSettings);
            setShowNotifications(false);
          }}
          style={{
            transform: "none",
            transition: "background-color 0.2s, color 0.2s",
          }}
        >
          <Settings size={iconSize} className={iconClass} />
          {showSettings && (
            <SettingsDropdown
              user={user}
              handleSignOut={() =>
                handleSignOut(supabase, isRejected, user?.id, signOut)
              }
              supabase={supabase}
              isRejected={isRejected}
              signOut={signOut}
            />
          )}
        </div>
        <br />
        <button
          ref={messageButtonRef}
          onMouseEnter={() => {
            setShowNotifications(false);
            setShowSettings(false);
          }}
          onClick={(e) => {
            stopPropagation(e);
            setShowMessage((prev) => !prev);
            handleUnreadMessages();
            // Added logic to mark messages as read when the button is clicked
            if (hasUnreadMessages && user) {
              setHasNewNotification(false);
              setNotifNumber(0);
              setShowNotifications(false);
              setShowSettings(false);
              // Update the read_at field for the user
              // This assumes that the user object has an id property
              // and that the messages table has a read_at field
              // and a receiver_id field that matches the user's id
              // Adjust the query as necessary based on your database schema
              if (!user.id) return; // Ensure user.id is defined

              supabase
                .from("messages")
                .update({ read_at: new Date() })
                .eq("receiver_id", user.id)
                .then(({ error }) => {
                  if (error) {
                    console.error("Error marking messages as read:", error);
                  } else {
                    console.log("Messages marked as read successfully");
                  }
                });
              // Call the handleUnreadMessages function to update the state
            }
          }}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
          style={{
            transform: "none",
            transition: "background-color 0.2s, color 0.2s",
          }}
        >
          <MessageSquare
            size={iconSize}
            className={`${iconClass} ${hasUnreadMessages ? "text-white" : ""}`}
          />
        </button>
        {/* Mobile menu button moved to the right */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            transform: "none",
            transition: "background-color 0.2s, color 0.2s",
          }}
        >
          <Menu size={iconSize} className={iconClass} />
        </button>
      </div>
    </div>
  );
}
