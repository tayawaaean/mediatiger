import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import Messages from "../../../pages/Messages";
import { handleSignOut } from "../../../utils/auth";
import { NotificationItem } from "../../../utils/notifications";

// Components
import OnboardingPopup from "../../../components/Onboarding-Stepper/OnboardingPopup";
import BannedComponent from "../components/BannedComponent";
import { DashboardContent } from "../components/DashboardContent";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardLayout } from "../components/DashboardLayout";
import { useNavigationItems } from "../components/navigationItems";
import PendingApplicationPopup from "../components/PendingApplicationPopup";
import { RejectedApplication } from "../components/RejectedApplication";
import Sidebar from "../components/SideBar";
import UsernameSetupModal from "../components/UsernameSetupModal";

//Hooks
import { useMessages } from "../../../hooks/useMessages";
import { useNotifications } from "../../../hooks/useNotifications"; // Import from our new provider
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useDashboardAuth } from "../hooks/useDashboardAuth";
import { useDashboardData } from "../hooks/useDashboardData";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard(): JSX.Element {
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const navigationItems = useNavigationItems();

  // Get showOnboarding directly from AuthContext
  const { showOnboarding, setShowOnboarding } = useAuth();

  // Custom hooks
  const {
    user,
    signOut,
    isLoading,
    isRejected,
    reason,
    hasChanel,
    isBanned,
    isPending,
  } = useDashboardAuth();

  // Use our notifications hook - no need to pass user anymore
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    notifNumber,
    notification,
    isVisible,
    notificationType,
    handleMarkAllAsRead,
    handleClearNotifications,
    setHasNewNotification,
    setNotifications,
    setNotifNumber,
  } = useNotifications();

  const { showMessages, setShowMessage, hasUnreadMessages } = useMessages(user);

  const {
    uploadingImage,
    profileImage,
    username,
    setUsername,
    showUsernameModal,
    setShowUsernameModal,
    showTutorial,
    setShowTutorial,
    handleImageUpload,
  } = useUserProfile(user);

  const {
    activeSection,
    setActiveSection,
    monthlyViews,
    linkedChannels,
    recentActivity,
    realtimeViews,
    performanceData,
  } = useDashboardData(user, hasChanel);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <span className="text-white text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <RejectedApplication
        reason={reason}
        handleSignOut={() => {
          handleSignOut(supabase, isRejected, user?.id, signOut);
        }}
      />
    );
  }

  if (isBanned && !isLoading) {
    return <BannedComponent handleSignOut={signOut} />;
  }

  console.log(
    "[Dashboard] Header - showOnboarding - isPending ",
    showOnboarding,
    isPending
  );

  return (
    <>
      {showMessages && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => {
            // Close messages if clicking outside the messages container
            if (e.target === e.currentTarget) {
              setShowMessage(false);
            }
          }}
        >
          <div className="w-full h-full max-w-4xl rounded-lg shadow-xl overflow-auto flex items-center">
            <Messages />
          </div>
        </div>
      )}

      <UsernameSetupModal
        setDashboardUsername={setUsername}
        isOpen={showUsernameModal}
        onClose={() => {
          setShowUsernameModal(false);
          setShowTutorial(true);
        }}
      />

      {/* Use the new PendingApplicationPopup component */}
      <PendingApplicationPopup isOpen={isPending} />

      {isVisible && notification && (
        <NotificationItem
          notification={notification}
          notificationType={notificationType}
        />
      )}

      {showOnboarding && user && (
        <OnboardingPopup
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userId={user.id}
          userEmail={user.email || ""}
        />
      )}

      <DashboardLayout
        sidebar={
          !showOnboarding &&
          !isPending && (
            <Sidebar
              user={user}
              username={username || ""}
              profileImage={profileImage}
              uploadingImage={uploadingImage}
              handleImageUpload={handleImageUpload}
              navigationItems={navigationItems}
              setActiveSection={setActiveSection}
              showTuto={showTutorial}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          )
        }
        header={
          !showOnboarding &&
          !isPending && (
            <DashboardHeader
              activeSection={activeSection}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              hasUnreadMessages={hasUnreadMessages}
              setShowMessage={setShowMessage}
              notifications={notifications}
              notifNumber={notifNumber}
              user={user}
              signOut={signOut}
              isRejected={isRejected}
              handleMarkAllAsRead={handleMarkAllAsRead}
              handleClearNotifications={handleClearNotifications}
              // Include these properties from the context
              setHasNewNotification={setHasNewNotification}
              setNotifications={setNotifications}
              setNotifNumber={setNotifNumber}
            />
          )
        }
      >
        {!showOnboarding && !isPending && (
          <div className="w-full h-full">
            <DashboardContent
              activeSection={activeSection}
              user={user}
              linkedChannels={linkedChannels}
              monthlyViews={monthlyViews}
              realtimeViews={realtimeViews}
              recentActivity={recentActivity}
              performanceData={performanceData}
            />
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
