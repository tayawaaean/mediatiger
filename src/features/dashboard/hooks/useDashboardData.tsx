import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  fetchDashboardStats,
} from "../../../services/dashboardService";
import { dummyAnalyticsService } from "../../../services/dummyAnalyticsService";

// 🎯 Local getUserChannels function for this hook
const getUserChannels = async (userId: string) => {
  try {
    console.log('🔍 Getting channels for user:', userId);
    
    // Get user's main request with split percentage
    const { data: requestData, error: requestError } = await supabase
      .from('user_requests')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (requestError) {
      console.error('❌ Error fetching user_requests:', requestError);
      return { split: 100, channels: [] };
    }

    console.log('📊 User request data:', requestData);

    if (!requestData || requestData.status !== 'approved') {
      console.log('⚠️ User request not approved, returning empty result');
      return { split: Number(requestData?.split_percent ?? 100), channels: [] };
    }

    const youtubeLinks = requestData?.youtube_links || [];
    console.log('📊 YouTube links:', youtubeLinks);

    // Get individual channels linked to this user
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved');

    if (channelsError) {
      console.error('❌ Error fetching channels:', channelsError);
    }
    
    console.log('📊 Channels data:', channelsData);

    // Collect all channel names to match with analytics_channels
    const channelNames = [];
    
    // Add main channel name from user_requests
    if (requestData.youtube_channel_name) {
      channelNames.push(requestData.youtube_channel_name);
    }
    
    // Add individual channel names from channels table
    const individualNames = (channelsData || [])
      .map((r) => r.channel_name)
      .filter(Boolean) as string[];
    channelNames.push(...individualNames);

    // Get analytics CIDs for these channel names
    let analyticsChannels: Array<{ cid: string; cname: string }> = [];
    if (channelNames.length > 0) {
      console.log('🔍 Fetching analytics channels for names:', channelNames);
      
      const { data: ac, error: acError } = await supabase
        .from('analytics_channels')
        .select('cid, cname')
        .in('cname', channelNames);

      if (acError) {
        console.error('❌ Error fetching analytics_channels:', acError);
      } else {
        analyticsChannels = ac || [];
        console.log('📊 Analytics channels found:', analyticsChannels);
      }
    } else {
      console.log('⚠️ No channel names to fetch analytics for');
    }

    // Build channel list with analytics CIDs
    const channels = [];

    // Add main channels from youtube_links
    for (const url of youtubeLinks) {
      const existingChannel = channelsData?.find(c => c.link === url);
      
      let channelName = 'Unknown Channel';
      let thumbnail = '';
      let analyticsCid = null;
      
      if (existingChannel?.channel_name && existingChannel?.thumbnail) {
        channelName = existingChannel.channel_name;
        thumbnail = existingChannel.thumbnail;
      } else if (requestData?.youtube_channel_name && requestData?.youtube_channel_thumbnail) {
        channelName = requestData.youtube_channel_name;
        thumbnail = requestData.youtube_channel_thumbnail;
      }

      // Find analytics CID for this channel
      const analyticsChannel = analyticsChannels.find(ac => ac.cname === channelName);
      if (analyticsChannel) {
        analyticsCid = analyticsChannel.cid;
      }

      channels.push({
        id: url,
        name: channelName,
        status: 'approved',
        thumbnail,
        registration_date: requestData.created_at,
        approval_date: existingChannel?.updated_at || requestData.updated_at,
        analyticsCid
      });
    }

    // Add individual channels from channels table
    for (const channel of channelsData || []) {
      if (channel.channel_name && channel.link) {
        // Find analytics CID for this channel
        const analyticsChannel = analyticsChannels.find(ac => ac.cname === channel.channel_name);
        
        channels.push({
          id: channel.id.toString(),
          name: channel.channel_name,
          status: channel.status,
          thumbnail: channel.thumbnail || '',
          registration_date: channel.created_at,
          approval_date: channel.updated_at,
          analyticsCid: analyticsChannel?.cid || null
        });
      }
    }

    console.log('🎯 Final channels list:', channels);
    return { split: Number(requestData?.split_percent ?? 100), channels };
  } catch (error) {
    console.error('❌ Error in getUserChannels:', error);
    return { split: 100, channels: [] };
  }
};

// 🎯 Fetch channel approval activities for recent activity
const fetchChannelApprovalActivities = async (userId: string): Promise<ActivityItem[]> => {
  try {
    console.log('🔍 Fetching channel approval activities for user:', userId);
    
    // Get user's main request ID to link with channels
    const { data: requestData, error: requestError } = await supabase
      .from('user_requests')
      .select('id, youtube_channel_name, youtube_channel_thumbnail')
      .eq('user_id', userId)
      .single();

    if (requestError || !requestData) {
      console.log('⚠️ No user request found, skipping channel approval activities');
      return [];
    }

    console.log('📋 User request data:', requestData);

    // Get all channels linked to this user (both by user_id and main_request_id)
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .or(`user_id.eq.${userId},main_request_id.eq.${requestData.id}`)
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (channelsError) {
      console.error('❌ Error fetching channels for approval activities:', channelsError);
      return [];
    }

    if (!channelsData || channelsData.length === 0) {
      console.log('⚠️ No approved channels found for approval activities');
      return [];
    }

    console.log('📊 Found approved channels for activities:', channelsData);

    // Convert channels to activity items
    const approvalActivities: ActivityItem[] = channelsData.map((channel, index) => {
      const channelName = channel.channel_name || 'Unknown Channel';
      const channelLink = channel.link || '';
      
      return {
        id: `channel_approval_${channel.id}`,
        type: "channel_approval" as const,
        title: "Channel Approved",
        description: `Your channel "${channelName}" has been approved and is now active.`,
        timestamp: channel.updated_at || channel.created_at,
        metadata: {
          channelName,
          channelLink,
          amount: 1,
          trend: "up" as const
        }
      };
    });

    console.log('📝 Generated channel approval activities:', approvalActivities);
    return approvalActivities;

  } catch (error) {
    console.error('❌ Error fetching channel approval activities:', error);
    return [];
  }
};

// 🎯 NEW: Detect increases in views and revenue based on analytics data
const detectAnalyticsIncreases = async (userId: string): Promise<ActivityItem[]> => {
  try {
    console.log('🔍 Detecting analytics increases for user:', userId);
    
    // Get user's channels to find their analytics CIDs
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('analytics_cid, channel_name, link')
      .or(`user_id.eq.${userId},main_request_id.eq.${userId}`)
      .eq('status', 'approved');

    if (channelsError || !channelsData || channelsData.length === 0) {
      console.log('⚠️ No approved channels found for analytics detection');
      return [];
    }

    const analyticsCids = channelsData.map(c => c.analytics_cid).filter(Boolean);
    if (analyticsCids.length === 0) {
      console.log('⚠️ No analytics CIDs found for channels');
      return [];
    }

    console.log('📊 Analytics CIDs to check:', analyticsCids);

    const increaseActivities: ActivityItem[] = [];

    // Check each channel for increases
    for (const channel of channelsData) {
      if (!channel.analytics_cid) continue;

      try {
        // Get current day analytics
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        
        // Get yesterday analytics for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        // Get current day data from analytics_channels
        const { data: currentData, error: currentError } = await supabase
          .from('analytics_channels')
          .select('total_views, total_revenue, total_premium_views')
          .eq('cid', channel.analytics_cid)
          .eq('date', todayStr);

        // Get previous day data for comparison
        const { data: previousData, error: previousError } = await supabase
          .from('analytics_channels')
          .select('total_views, total_revenue, total_premium_views')
          .eq('cid', channel.analytics_cid)
          .eq('date', yesterdayStr);

        if (currentError || previousError) {
          console.warn(`⚠️ Error fetching analytics for channel ${channel.channel_name}:`, currentError || previousError);
          continue;
        }

        // Calculate current and previous totals
        const currentViews = currentData?.reduce((sum, row) => sum + (row.total_views || 0), 0) || 0;
        const currentRevenue = currentData?.reduce((sum, row) => sum + Number(row.total_revenue || 0), 0) || 0;
        const currentPremiumViews = currentData?.reduce((sum, row) => sum + (row.total_premium_views || 0), 0) || 0;

        const previousViews = previousData?.reduce((sum, row) => sum + (row.total_views || 0), 0) || 0;
        const previousRevenue = previousData?.reduce((sum, row) => sum + Number(row.total_revenue || 0), 0) || 0;
        const previousPremiumViews = previousData?.reduce((sum, row) => sum + (row.total_premium_views || 0), 0) || 0;

        console.log(`📊 Channel ${channel.channel_name} analytics:`, {
          current: { views: currentViews, revenue: currentRevenue, premiumViews: currentPremiumViews },
          previous: { views: previousViews, revenue: previousRevenue, premiumViews: previousPremiumViews }
        });

        // Check for significant increases (more than 10% or at least 5 views)
        const viewIncrease = currentViews - previousViews;
        const revenueIncrease = currentRevenue - previousRevenue;
        const premiumViewIncrease = currentPremiumViews - previousPremiumViews;

        // Views increase activity
        if (viewIncrease > 5 && (viewIncrease / Math.max(previousViews, 1)) > 0.1) {
          const percentageIncrease = Math.round((viewIncrease / Math.max(previousViews, 1)) * 100);
          increaseActivities.push({
            id: `views_increase_${channel.analytics_cid}_${todayStr}`,
            type: "view" as const,
            title: "Views Increased",
            description: `Your channel "${channel.channel_name}" saw a ${percentageIncrease}% increase in views (${viewIncrease} more views).`,
            timestamp: today.toISOString(),
            metadata: {
              channelName: channel.channel_name,
              channelLink: channel.link,
              amount: viewIncrease,
              trend: "up" as const
            }
          });
        }

        // Revenue increase activity
        if (revenueIncrease > 0.001 && (revenueIncrease / Math.max(previousRevenue, 0.001)) > 0.1) {
          const percentageIncrease = Math.round((revenueIncrease / Math.max(previousRevenue, 0.001)) * 100);
          increaseActivities.push({
            id: `revenue_increase_${channel.analytics_cid}_${todayStr}`,
            type: "revenue" as const,
            title: "Revenue Increased",
            description: `Your channel "${channel.channel_name}" generated $${revenueIncrease.toFixed(4)} more revenue (${percentageIncrease}% increase).`,
            timestamp: today.toISOString(),
            metadata: {
              channelName: channel.channel_name,
              channelLink: channel.link,
              amount: revenueIncrease,
              trend: "up" as const
            }
          });
        }

        // Premium views increase activity
        if (premiumViewIncrease > 2 && (premiumViewIncrease / Math.max(previousPremiumViews, 1)) > 0.1) {
          const percentageIncrease = Math.round((premiumViewIncrease / Math.max(previousPremiumViews, 1)) * 100);
          increaseActivities.push({
            id: `premium_views_increase_${channel.analytics_cid}_${todayStr}`,
            type: "view" as const,
            title: "Premium Views Increased",
            description: `Your channel "${channel.channel_name}" saw a ${percentageIncrease}% increase in premium views (${premiumViewIncrease} more premium views).`,
            timestamp: today.toISOString(),
            metadata: {
              channelName: channel.channel_name,
              channelLink: channel.link,
              amount: premiumViewIncrease,
              trend: "up" as const
            }
          });
        }

      } catch (error) {
        console.warn(`⚠️ Error processing analytics for channel ${channel.channel_name}:`, error);
        continue;
      }
    }

    console.log('📝 Generated analytics increase activities:', increaseActivities);
    return increaseActivities;

  } catch (error) {
    console.error('❌ Error detecting analytics increases:', error);
    return [];
  }
};

// 🎯 NEW: Detect video performance increases using daily_video_analytics
const detectVideoPerformanceIncreases = async (userId: string): Promise<ActivityItem[]> => {
  try {
    console.log('🔍 Detecting video performance increases for user:', userId);
    
    // Get user's channels to find their analytics CIDs
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('analytics_cid, channel_name, link')
      .or(`user_id.eq.${userId},main_request_id.eq.${userId}`)
      .eq('status', 'approved');

    if (channelsError || !channelsData || channelsData.length === 0) {
      console.log('⚠️ No approved channels found for video performance detection');
      return [];
    }

    const analyticsCids = channelsData.map(c => c.analytics_cid).filter(Boolean);
    if (analyticsCids.length === 0) {
      console.log('⚠️ No analytics CIDs found for video performance detection');
      return [];
    }

    console.log('📊 Checking video performance for CIDs:', analyticsCids);

    const videoActivities: ActivityItem[] = [];

    // Check each channel for video performance
    for (const channel of channelsData) {
      if (!channel.analytics_cid) continue;

      try {
        // Get current day video analytics
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        
        // Get yesterday video analytics for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        // Get current day video data from daily_video_analytics
        const { data: currentVideoData, error: currentVideoError } = await supabase
          .from('daily_video_analytics')
          .select('vid, views, estimated_partner_revenue, watch_time_minutes')
          .eq('cid', channel.analytics_cid)
          .eq('date', todayStr);

        // Get previous day video data for comparison
        const { data: previousVideoData, error: previousVideoError } = await supabase
          .from('daily_video_analytics')
          .select('vid, views, estimated_partner_revenue, watch_time_minutes')
          .eq('cid', channel.analytics_cid)
          .eq('date', yesterdayStr);

        if (currentVideoError || previousVideoError) {
          console.warn(`⚠️ Error fetching video analytics for channel ${channel.channel_name}:`, currentVideoError || previousVideoError);
          continue;
        }

        // Group by video ID and calculate totals
        const currentVideos = new Map();
        const previousVideos = new Map();

        currentVideoData?.forEach(row => {
          const vid = row.vid;
          if (!currentVideos.has(vid)) {
            currentVideos.set(vid, { views: 0, revenue: 0, watchTime: 0 });
          }
          currentVideos.get(vid).views += row.views || 0;
          currentVideos.get(vid).revenue += Number(row.estimated_partner_revenue || 0);
          currentVideos.get(vid).watchTime += Number(row.watch_time_minutes || 0);
        });

        previousVideoData?.forEach(row => {
          const vid = row.vid;
          if (!previousVideos.has(vid)) {
            previousVideos.set(vid, { views: 0, revenue: 0, watchTime: 0 });
          }
          previousVideos.get(vid).views += row.views || 0;
          previousVideos.get(vid).revenue += Number(row.estimated_partner_revenue || 0);
          previousVideos.get(vid).watchTime += Number(row.watch_time_minutes || 0);
        });

        // Check for video performance increases
        for (const [vid, currentStats] of currentVideos) {
          const previousStats = previousVideos.get(vid) || { views: 0, revenue: 0, watchTime: 0 };
          
          const viewIncrease = currentStats.views - previousStats.views;
          const revenueIncrease = currentStats.revenue - previousStats.revenue;
          const watchTimeIncrease = currentStats.watchTime - previousStats.watchTime;

          // Video views increase activity (significant increase)
          if (viewIncrease > 10 && (viewIncrease / Math.max(previousStats.views, 1)) > 0.15) {
            const percentageIncrease = Math.round((viewIncrease / Math.max(previousStats.views, 1)) * 100);
            videoActivities.push({
              id: `video_views_increase_${vid}_${todayStr}`,
              type: "view" as const,
              title: "Video Views Surge",
              description: `A video on "${channel.channel_name}" gained ${viewIncrease} more views (${percentageIncrease}% increase).`,
              timestamp: today.toISOString(),
              metadata: {
                channelName: channel.channel_name,
                channelLink: channel.link,
                amount: viewIncrease,
                trend: "up" as const
              }
            });
          }

          // Video revenue increase activity
          if (revenueIncrease > 0.001 && (revenueIncrease / Math.max(previousStats.revenue, 0.001)) > 0.2) {
            const percentageIncrease = Math.round((revenueIncrease / Math.max(previousStats.revenue, 0.001)) * 100);
            videoActivities.push({
              id: `video_revenue_increase_${vid}_${todayStr}`,
              type: "revenue" as const,
              title: "Video Revenue Boost",
              description: `A video on "${channel.channel_name}" generated $${revenueIncrease.toFixed(4)} more revenue (${percentageIncrease}% increase).`,
              timestamp: today.toISOString(),
              metadata: {
                channelName: channel.channel_name,
                channelLink: channel.link,
                amount: revenueIncrease,
                trend: "up" as const
              }
            });
          }

          // High performing video (over 100 views in a day)
          if (currentStats.views > 100 && viewIncrease > 0) {
            videoActivities.push({
              id: `high_performing_video_${vid}_${todayStr}`,
              type: "milestone" as const,
              title: "High Performing Video",
              description: `A video on "${channel.channel_name}" is performing well with ${currentStats.views} views today.`,
              timestamp: today.toISOString(),
              metadata: {
                channelName: channel.channel_name,
                channelLink: channel.link,
                amount: currentStats.views,
                trend: "up" as const
              }
            });
          }
        }

      } catch (error) {
        console.warn(`⚠️ Error processing video analytics for channel ${channel.channel_name}:`, error);
        continue;
      }
    }

    console.log('📝 Generated video performance activities:', videoActivities);
    return videoActivities;

  } catch (error) {
    console.error('❌ Error detecting video performance increases:', error);
    return [];
  }
};

export interface ActivityItem {
  id: string;
  type: "view" | "subscriber" | "revenue" | "milestone" | "channel_approval";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    trend?: "up" | "down" | "neutral";
    percentage?: number;
    channelName?: string;
    channelLink?: string;
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

export function useDashboardData(user: any, hasChanel: boolean) {
  const [activeSection, setActiveSection] = useState("overview");
  const [monthlyViews, setMonthlyViews] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [linkedChannels, setLinkedChannels] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [realtimeViews, setRealtimeViews] = useState({
    current: 0,
    last24h: 0,
    last48h: 0,
    last7Days: 0,
  });


  // 🎯 Fetch real analytics data from database
  // This function populates:
  // - August performance trends (views, revenue, engagement)
  // - Realtime performance (current, 24h, 48h, 7-day views)
  // - Recent activity based on actual data
  const fetchRealAnalyticsData = async (userId: string) => {
    try {
      // Get user's approved channels
      const { channels } = await getUserChannels(userId);
      const analyticsCids = channels
        .map(c => c.analyticsCid)
        .filter(Boolean) as string[];
      
      if (analyticsCids.length === 0) {
        console.log('⚠️ No analytics CIDs found for user');
        
        // 🎯 Set fallback recent activity when no channels are available
        const noChannelsActivity: ActivityItem[] = [
          {
            id: "1",
            type: "view",
            title: "No Channels Connected",
            description: "Connect your YouTube channels to start seeing analytics data.",
            timestamp: new Date().toISOString(),
            metadata: { amount: 0, trend: "neutral" }
          },
          {
            id: "2",
            type: "revenue",
            title: "Get Started",
            description: "Set up your first channel to begin tracking performance.",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            metadata: { amount: 0, trend: "neutral" }
          }
        ];
        setRecentActivity(noChannelsActivity);
        return;
      }

      // Get current month (August 2025)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 7 for August (0-indexed)
      const currentYear = currentDate.getFullYear();
      
      // Calculate date range for August
      const augustStart = new Date(currentYear, currentMonth, 1);
      const augustEnd = new Date(currentYear, currentMonth + 1, 0); // Last day of August
      
      const startStr = augustStart.toISOString().slice(0, 10);
      const endStr = augustEnd.toISOString().slice(0, 10);
      
      console.log('📅 Fetching August analytics:', { startStr, endStr, analyticsCids });
      
      // 1. Fetch August performance data
      console.log('🔍 Fetching August data with params:', {
        analyticsCids,
        startStr,
        endStr,
        cidCount: analyticsCids.length
      });
      
      const { data: augustData, error: augustError } = await supabase
        .from('daily_channel_analytics')
        .select('date, total_views, total_revenue, total_premium_views')
        .in('cid', analyticsCids)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true });
      
      if (augustError) {
        console.error('❌ Error fetching August data:', augustError);
        return;
      }
      
      console.log('📊 August analytics data:', {
        data: augustData,
        count: augustData?.length || 0,
        hasData: augustData && augustData.length > 0,
        sampleRecord: augustData?.[0]
      });
      
      // 2. Calculate realtime performance (last 24h, 48h, 7 days)
      // 🎯 Enhanced realtime calculation with proper timezone handling
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const last24hStr = last24h.toISOString().slice(0, 10);
      const last48hStr = last48h.toISOString().slice(0, 10);
      const last7DaysStr = last7Days.toISOString().slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      
      console.log('⏰ Realtime time ranges:', {
        now: now.toISOString(),
        last24h: last24hStr,
        last48h: last48hStr,
        last7Days: last7DaysStr,
        today: todayStr
      });
      
      // Fetch realtime data with enhanced query
      const { data: realtimeData, error: realtimeError } = await supabase
        .from('daily_channel_analytics')
        .select('date, total_views, total_revenue, total_premium_views, cid')
        .in('cid', analyticsCids)
        .gte('date', last7DaysStr)
        .lte('date', todayStr)
        .order('date', { ascending: true });
      
      if (realtimeError) {
        console.error('❌ Error fetching realtime data:', realtimeError);
        return;
      }
      
      // 3. Process August data for performance trends
      if (augustData && augustData.length > 0) {
        // Aggregate August data by date
        const augustByDate = new Map<string, { views: number; revenue: number; premium: number }>();
        augustData.forEach(record => {
          const key = record.date;
          const prev = augustByDate.get(key) || { views: 0, revenue: 0, premium: 0 };
          prev.views += Number(record.total_views || 0);
          prev.revenue += Number(record.total_revenue || 0);
          prev.premium += Number(record.total_premium_views || 0);
          augustByDate.set(key, prev);
        });
        
        // Performance data generation removed - component no longer needed
        console.log('📈 August analytics data processed (performance trends removed)');
      }
      
      // 4. Process realtime data with enhanced calculations
      if (realtimeData && realtimeData.length > 0) {
        console.log('📊 Raw realtime data:', realtimeData);
        
        // 🎯 Calculate current views (today's data)
        const currentViews = realtimeData
          .filter(r => r.date === todayStr)
          .reduce((sum, r) => sum + Number(r.total_views || 0), 0);
        
        // 🎯 Calculate last 24 hours (including partial day data)
        const last24hViews = realtimeData
          .filter(r => r.date >= last24hStr)
          .reduce((sum, r) => sum + Number(r.total_views || 0), 0);
        
        // 🎯 Calculate last 48 hours
        const last48hViews = realtimeData
          .filter(r => r.date >= last48hStr)
          .reduce((sum, r) => sum + Number(r.total_views || 0), 0);
        
        // 🎯 Calculate last 7 days
        const last7DaysViews = realtimeData
          .filter(r => r.date >= last7DaysStr)
          .reduce((sum, r) => sum + Number(r.total_views || 0), 0);
        
        // 🎯 Enhanced realtime views with data validation
        const validatedRealtimeViews = {
          current: Math.max(0, currentViews),
          last24h: Math.max(0, last24hViews),
          last48h: Math.max(0, last48hViews),
          last7Days: Math.max(0, last7DaysViews)
        };
        
        setRealtimeViews(validatedRealtimeViews);
        
        console.log('⏰ Enhanced realtime views set:', {
          raw: { currentViews, last24hViews, last48hViews, last7DaysViews },
          validated: validatedRealtimeViews,
          dataPoints: realtimeData.length,
          dateRange: { from: last7DaysStr, to: todayStr }
        });
        
        // 🎯 Additional realtime insights
        if (realtimeData.length > 1) {
          const yesterdayViews = realtimeData
            .filter(r => r.date === last24hStr)
            .reduce((sum, r) => sum + Number(r.total_views || 0), 0);
          
          const dayBeforeYesterdayViews = realtimeData
            .filter(r => r.date === last48hStr)
            .reduce((sum, r) => sum + Number(r.total_views || 0), 0);
          
          console.log('📈 Realtime insights:', {
            todayVsYesterday: currentViews > yesterdayViews ? '📈 Up' : '📉 Down',
            yesterdayVsDayBefore: yesterdayViews > dayBeforeYesterdayViews ? '📈 Up' : '📉 Down',
            trend: currentViews > yesterdayViews ? 'Positive' : 'Negative'
          });
        }
      } else {
        console.log('⚠️ No realtime data available for the specified time range');
        // Set default values when no data is available
        setRealtimeViews({
          current: 0,
          last24h: 0,
          last48h: 0,
          last7Days: 0
        });
      }
      
      // 5. Generate recent activity based on real data
      if (augustData && augustData.length > 0) {
        const totalAugustViews = augustData.reduce((sum, r) => sum + Number(r.total_views || 0), 0);
        const totalAugustRevenue = augustData.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0);
        
        // 🎯 Set August totals to dashboard state
        setMonthlyViews(totalAugustViews);
        setMonthlyRevenue(totalAugustRevenue);
        console.log('📊 Set August monthly views:', totalAugustViews);
        console.log('💰 Set August monthly revenue:', totalAugustRevenue);
        
        // 🎯 Generate real recent activity from analytics data
        const realActivity: ActivityItem[] = [
          {
            id: "1",
            type: "view",
            title: "August Performance",
            description: `Your channels generated ${totalAugustViews.toLocaleString()} views in August`,
            timestamp: new Date().toISOString(),
            metadata: { amount: totalAugustViews, trend: "up" }
          },
          {
            id: "2",
            type: "revenue",
            title: "August Revenue",
            description: `Total revenue: $${totalAugustRevenue.toFixed(2)}`,
            timestamp: new Date().toISOString(),
            metadata: { amount: totalAugustRevenue, trend: "up" }
          }
        ];

        // 🎯 Add channel approval activities to recent activity
        const channelApprovalActivities = await fetchChannelApprovalActivities(userId);
        if (channelApprovalActivities.length > 0) {
          realActivity.push(...channelApprovalActivities);
          console.log('📝 Added channel approval activities to recent activity:', channelApprovalActivities);
        }

        // 🎯 Add analytics increase activities to recent activity
        const analyticsIncreaseActivities = await detectAnalyticsIncreases(userId);
        if (analyticsIncreaseActivities.length > 0) {
          realActivity.push(...analyticsIncreaseActivities);
          console.log('📝 Added analytics increase activities to recent activity:', analyticsIncreaseActivities);
        }

        // 🎯 Add video performance increase activities to recent activity
        const videoPerformanceActivities = await detectVideoPerformanceIncreases(userId);
        if (videoPerformanceActivities.length > 0) {
          realActivity.push(...videoPerformanceActivities);
          console.log('📝 Added video performance activities to recent activity:', videoPerformanceActivities);
        }
        
        setRecentActivity(realActivity);
        console.log('📝 Recent activity set from real data:', realActivity);
      } else {
        // 🎯 No real August data available - only show channel approval activities
        console.log('⚠️ No real August data available, checking for channel approval activities only');
        
        // ✅ ALWAYS fetch channel approval activities
        const channelApprovalActivities = await fetchChannelApprovalActivities(userId);
        if (channelApprovalActivities.length > 0) {
          setRecentActivity(channelApprovalActivities);
          console.log('📝 Set recent activity to channel approval activities only:', channelApprovalActivities);
        } else {
          // Show simple message when no activities exist
          const noActivitiesMessage: ActivityItem[] = [
            {
              id: "no_activities",
              type: "view",
              title: "No Recent Activity",
              description: "Connect your channels to start seeing activity updates.",
              timestamp: new Date().toISOString(),
              metadata: { amount: 0, trend: "neutral" }
            }
          ];
          setRecentActivity(noActivitiesMessage);
          console.log('📝 No channel approval activities found, showing no activity message');
        }

        // 🎯 Also check for analytics increases even in fallback scenario
        const analyticsIncreaseActivities = await detectAnalyticsIncreases(userId);
        if (analyticsIncreaseActivities.length > 0) {
          // If we have analytics increases, show them instead of the no activity message
          setRecentActivity(analyticsIncreaseActivities);
          console.log('📝 Set recent activity to analytics increase activities in fallback:', analyticsIncreaseActivities);
        }

        // 🎯 Also check for video performance increases in fallback scenario
        const videoPerformanceActivities = await detectVideoPerformanceIncreases(userId);
        if (videoPerformanceActivities.length > 0) {
          // If we have video performance increases, show them
          const allActivities = [...(analyticsIncreaseActivities || []), ...videoPerformanceActivities];
          setRecentActivity(allActivities);
          console.log('📝 Set recent activity to all performance activities in fallback:', allActivities);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in fetchRealAnalyticsData:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 [useDashboardData] useEffect triggered');
    console.log('🔍 [useDashboardData] user:', user ? { id: user.id, email: user.email } : null);
    console.log('🔍 [useDashboardData] hasChanel:', hasChanel);
    
    if (!user) {
      console.log('⚠️ [useDashboardData] No user, returning early');
      return;
    }

    const fetchAllData = async () => {
      // 🔧 TEMPORARY: Force hasChanel to true to test channel approval activities
      const forceHasChanel = true;
      
      if (!forceHasChanel || !user.id) {
        console.log('⚠️ [useDashboardData] hasChanel or user.id missing:', { hasChanel: forceHasChanel, userId: user.id });
        return;
      }
      
      try {
        console.log('🔍 Starting fetchAllData for user:', user.id);
        console.log('�� hasChanel value:', forceHasChanel);
        
        // Fetch dashboard stats (monthly views and linked channels)
        const stats = await fetchDashboardStats(supabase, user.id);
        setMonthlyViews(stats.monthlyViews);
        setLinkedChannels(stats.linkedChannels);
        
        // Fetch real analytics data for August
        await fetchRealAnalyticsData(user.id);
        
        // Generate goals (keeping this as dummy for now)
        setGoals(dummyAnalyticsService.generateGoals());
        
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        
        // 🎯 Error fallback: Only show channel approval activities if they exist
        console.log('⚠️ Error occurred, checking for channel approval activities only');
        
        try {
          const channelApprovalActivities = await fetchChannelApprovalActivities(user.id);
          if (channelApprovalActivities.length > 0) {
            setRecentActivity(channelApprovalActivities);
            console.log('📝 Set recent activity to channel approval activities after error:', channelApprovalActivities);
          } else {
            // Show simple message when no activities exist
            const noActivitiesMessage: ActivityItem[] = [
              {
                id: "no_activities_error",
                type: "view",
                title: "No Recent Activity",
                description: "Connect your channels to start seeing activity updates.",
                timestamp: new Date().toISOString(),
                metadata: { amount: 0, trend: "neutral" }
              }
            ];
            setRecentActivity(noActivitiesMessage);
            console.log('📝 No channel approval activities found after error, showing no activity message');
          }
        } catch (approvalError) {
          console.error('❌ Error fetching channel approval activities in error fallback:', approvalError);
          // Set empty activity array if everything fails
          setRecentActivity([]);
        }
      }
    };

    fetchAllData();

    // 🎯 Set up multiple refresh intervals for different data types
    const mainInterval = setInterval(fetchAllData, 3600000); // Refresh main data every hour
    const realtimeInterval = setInterval(() => {
      // Refresh only realtime data more frequently
      if (user?.id) {
        fetchRealAnalyticsData(user.id);
      }
    }, 300000); // Refresh realtime data every 5 minutes
    
    return () => {
      clearInterval(mainInterval);
      clearInterval(realtimeInterval);
    };
  }, [user, hasChanel]);

  return {
    activeSection,
    setActiveSection,
    monthlyViews,
    monthlyRevenue,
    linkedChannels,
    recentActivity,
    goals,
    realtimeViews,
  };
}
