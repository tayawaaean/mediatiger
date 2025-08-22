import FadeInUp from "../../../components/FadeInUp";
import { RealtimePerformance } from "../../../components/RealtimePerformance";
import { RecentActivity } from "../../../components/RecentActivity";
import { ExtendedUser } from "../../../types/user";
import { Announcements } from "../../Announcement";
import MonthlyGoals from "../../GoalsComponent";
import { DashboardCards } from "../components/DashboardCards";
import { ActivityItem } from "../hooks/useDashboardData";

interface OverviewProps {
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

export default function Overview({
  user,
  linkedChannels,
  monthlyViews,
  monthlyRevenue,
  realtimeViews,
  recentActivity,
}: OverviewProps) {
  return (
    <div className="h-full w-full overflow-auto scrollbar-hide">
      <FadeInUp>
        <DashboardCards
          linkedChannels={linkedChannels}
          monthlyViews={monthlyViews}
          monthlyRevenue={monthlyRevenue}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 relative z-[1]">
          <Announcements preventAnimation />
          <RealtimePerformance realtimeViews={realtimeViews} />
          <MonthlyGoals user={user} />
          <RecentActivity recentActivity={recentActivity} />

        </div>
      </FadeInUp>
    </div>
  );
}
