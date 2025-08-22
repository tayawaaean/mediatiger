import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  fetchDashboardStats,
} from "../../../services/dashboardService";
import { dummyAnalyticsService } from "../../../services/dummyAnalyticsService";

export interface ActivityItem {
  id: string;
  type: "view" | "subscriber" | "revenue" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    trend?: "up" | "down";
    percentage?: number;
  };
}

export interface GoalProgress {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export function useDashboardData(user, hasChanel) {
  const [activeSection, setActiveSection] = useState("overview");
  const [monthlyViews, setMonthlyViews] = useState(0);
  const [linkedChannels, setLinkedChannels] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [realtimeViews, setRealtimeViews] = useState({
    current: 0,
    last24h: 0,
    last48h: 0,
    last7Days: 0,
  });
  const [performanceData, setPerformanceData] = useState({
    labels: [] as string[],
    views: [] as number[],
    engagement: [] as number[],
    revenue: [] as number[],
  });

  useEffect(() => {
    if (!user) return;

    // Use dummy analytics service for all data
    setRecentActivity(dummyAnalyticsService.generateRecentActivity());
    setGoals(dummyAnalyticsService.generateGoals());
    setPerformanceData(dummyAnalyticsService.generatePerformanceTrends(30));
    setRealtimeViews(dummyAnalyticsService.generateRealtimeData());

    const fetchStats = async () => {
      if (!hasChanel || !user.id) return;
      const stats = await fetchDashboardStats(supabase, user.id);
      setMonthlyViews(stats.monthlyViews);
      setLinkedChannels(stats.linkedChannels);
    };

    fetchStats();

    const interval = setInterval(fetchStats, 3600000);
    return () => clearInterval(interval);
  }, [user, hasChanel]);

  return {
    activeSection,
    setActiveSection,
    monthlyViews,
    linkedChannels,
    recentActivity,
    goals,
    realtimeViews,
    performanceData,
  };
}
