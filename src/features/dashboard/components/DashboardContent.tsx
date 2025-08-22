import { ExtendedUser } from "../../../types/user";
import ChannelManagement from "../../channel-management/pages/ChannelManagementUser";
import MusicComponent from "../../music/pages/MusicComponent";
import { ActivityItem } from "../hooks/useDashboardData";
import Analytics from "../pages/Analytics";
import BalanceSection from "../pages/Balance";
import Overview from "../pages/Overview";
import Guide from '../../guide/pages/Guide';

interface DashboardContentProps {
  activeSection: string;
  user: ExtendedUser;
  linkedChannels: number;
  monthlyViews: number;
  monthlyRevenue: number;
  realtimeViews: {
    current: number;
    last24h: number;
    last48h: number;
    last7Days: number;
  };
  recentActivity: ActivityItem[];
}

export function DashboardContent({
  activeSection,
  user,
  linkedChannels,
  monthlyViews,
  monthlyRevenue,
  realtimeViews,
  recentActivity,
}: DashboardContentProps) {
  if (activeSection === "overview") {
    return (
      <Overview
        user={user}
        linkedChannels={linkedChannels}
        monthlyViews={monthlyViews}
        monthlyRevenue={monthlyRevenue}
        realtimeViews={realtimeViews}
        recentActivity={recentActivity}
      />
    );
  }

  if (activeSection === "channels") {
    return <ChannelManagement />;
  }

  if (activeSection === "balance") {
    return <BalanceSection />;
  }

  if (activeSection === "analytics") {
    return <Analytics />;
  }

  if (activeSection === "music") {
    return (
      <div className="h-full w-full">
        <MusicComponent />
      </div>
    );
  }

  if (activeSection === "guides") {
    return (
        <Guide />
    );
  }

  // Default for other sections that are not yet implemented
  return (
    <div className="bg-slate-800 rounded-xl p-12 text-center">
      <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
      <p className="text-slate-400">
        This section is currently under development
      </p>
    </div>
  );
}
