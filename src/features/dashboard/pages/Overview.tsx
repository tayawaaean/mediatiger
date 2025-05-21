import { PerformanceTrends } from "../../../components/PerformanceTrends";
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
  realtimeViews: {
    current: number;
    last24h: number;
    last48h: number;
    last7Days: number;
  };
  recentActivity: ActivityItem[];
  performanceData: {
    labels: string[];
    views: number[];
    engagement: number[];
    revenue: number[];
  };
}

export default function Overview({
  user,
  linkedChannels,
  monthlyViews,
  realtimeViews,
  recentActivity,
  performanceData,
}: OverviewProps) {
  return (
    <div className="h-full w-full overflow-auto scrollbar-hide">

      <DashboardCards
          linkedChannels={linkedChannels}
          monthlyViews={monthlyViews}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 relative z-[1]">
        <Announcements />
        <RealtimePerformance realtimeViews={realtimeViews} />
        <MonthlyGoals user={user} />
        <RecentActivity recentActivity={recentActivity} />

        <PerformanceTrends performanceData={performanceData} />
      </div>
    </div>
  );
}
