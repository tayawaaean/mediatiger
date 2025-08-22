import { subDays } from "date-fns";
import { useState, useEffect } from "react";
import AnalyticsControls from "../components/AnalyticsControls";
import Header from "../components/Header";
import MetricCard from "../components/MetricCard";
import RevenueChart from "../components/RevenueChart";
import VideoSearch from "../components/VideoSearch";
import VideoTable from "../components/VideoTable";
import { initSectionAnimations } from "../../../utils/animations";
import FadeInUp from "../../../components/FadeInUp";
import { userChannelService } from "../../../services/userChannelService";
import { useAuth } from "../../../contexts/AuthContext";
import { AnalyticsData, ChannelInfo } from "../../../services/analyticsService";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

// Helper function to get user channels with analytics CIDs
async function getUserChannels(userId: string) {
  console.log('🔍 getUserChannels called for userId:', userId);
  
  try {
    // 1) Get user's main request with split percentage
    const { data: requestData, error: requestError } = await supabase
      .from('user_requests')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (requestError) {
      console.error('❌ Error fetching user_requests:', requestError);
      return { split: 100, channels: [] };
    }
    console.log('📋 user_requests data:', requestData);

    if (!requestData || requestData.status !== 'approved') {
      console.log('⚠️ User request not approved, returning empty result');
      return { split: Number(requestData?.split_percent ?? 100), channels: [] };
    }

    const youtubeLinks = requestData?.youtube_links || [];
    console.log('🔗 YouTube links from user_requests:', youtubeLinks);

    // 2) Get individual channels linked to this user
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId);

    if (channelsError) {
      console.error('❌ Error fetching channels:', channelsError);
    }
    console.log('📺 channels data:', channelsData);

    // 3) Collect all channel names to match with analytics_channels
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

    console.log('🔗 All channel names to match:', channelNames);

    // 4) Get analytics CIDs for these channel names
    let analyticsChannels: Array<{ cid: string; cname: string }> = [];
    if (channelNames.length > 0) {
      const { data: ac, error: acError } = await supabase
        .from('analytics_channels')
        .select('cid, cname')
        .in('cname', channelNames);

      if (acError) {
        console.error('❌ Error fetching analytics_channels:', acError);
      } else {
        analyticsChannels = ac || [];
        console.log('📊 analytics_channels data:', analyticsChannels);
      }
    }

    // 5) Build channel list with analytics CIDs
    const channels = [];

    // Add main channels from youtube_links
    for (const url of youtubeLinks) {
      const existingChannel = channelsData?.find(c => c.link === url);
      
      let channelName = 'Unknown Channel';
      let thumbnail = '';
      let analyticsCid = null;
      
      if (existingChannel?.channel_name && existingChannel?.thumbnail) {
        // Use stored data from channels table
        channelName = existingChannel.channel_name;
        thumbnail = existingChannel.thumbnail;
      } else if (requestData?.youtube_channel_name && requestData?.youtube_channel_thumbnail) {
        // Use stored data from user_requests table
        channelName = requestData.youtube_channel_name;
        thumbnail = requestData.youtube_channel_thumbnail;
      }

      // Find analytics CID for this channel name
      const analyticsChannel = analyticsChannels.find(ac => ac.cname === channelName);
      if (analyticsChannel) {
        analyticsCid = analyticsChannel.cid;
      }

      channels.push({
        id: `main_${url}`, // Use URL as ID for main channels
        name: channelName,
        status: 'approved',
        thumbnail,
        registration_date: new Date().toISOString(),
        approval_date: new Date().toISOString(),
        isMainChannel: true,
        url,
        analyticsCid // Add analytics CID for data fetching
      });
    }

    // Add individual channels from channels table
    const otherChannels = (channelsData || []).map((data) => {
      // Find analytics CID for this channel name
      const analyticsChannel = analyticsChannels.find(ac => ac.cname === data.channel_name);
      
      return {
        id: String(data.id),
        name: data.channel_name || 'Unknown Channel',
        status: data.status,
        thumbnail: data.thumbnail || '',
        registration_date: data.created_at,
        approval_date: data.created_at,
        isMainChannel: false,
        url: data.link,
        analyticsCid: analyticsChannel?.cid || null // Add analytics CID for data fetching
      };
    });

    channels.push(...otherChannels);

    console.log('🎯 Final channels array with analytics CIDs:', channels);

    return {
      split: Number(requestData.split_percent ?? 100),
      channels
    };
  } catch (error) {
    console.error('❌ Error in getUserChannels:', error);
    return { split: 100, channels: [] };
  }
}

// Helper function to apply split to analytics data
function applySplit(data: { date: string; views: number; premium: number; revenue: number }[], split: number) {
  const factor = Math.max(0, Math.min(100, split)) / 100;
  return data.map(d => ({
    date: d.date,
    views: Math.floor(d.views * factor),
    premium: Math.floor(d.premium * factor),
    revenue: Math.round(d.revenue * factor * 100) / 100,
  }));
}

// Helper function to fetch daily analytics from Supabase
async function fetchDaily(userId: string, start: string, end: string, selectedChannelId?: string) {
  const { split, channels } = await getUserChannels(userId);
  
  console.log('📊 fetchDaily called with:', { userId, start, end, selectedChannelId, channels });
  
  // Get analytics CIDs for the selected channel or all channels
  let targetCids: string[] = [];
  
  if (selectedChannelId && selectedChannelId !== "all") {
    // Find the specific channel
    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    if (selectedChannel?.analyticsCid) {
      targetCids = [selectedChannel.analyticsCid];
    }
  } else {
    // Get all available analytics CIDs
    targetCids = channels
      .map(c => c.analyticsCid)
      .filter(Boolean) as string[];
  }

  console.log('🎯 Target analytics CIDs:', targetCids);

  if (targetCids.length === 0) {
    console.log('⚠️ No analytics CIDs found, returning empty data');
    return { 
      split, 
      rows: [] as Array<{ date: string; views: number; premium: number; revenue: number }> 
    };
  }

  // Fetch real data from daily_channel_analytics
  const { data, error } = await supabase
    .from("daily_channel_analytics")
    .select("date, total_views, total_premium_views, total_revenue, cid")
    .in("cid", targetCids)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) {
    console.error('❌ Error fetching daily_channel_analytics:', error);
    return { split, rows: [] };
  }

  console.log('📊 Raw analytics data:', data);

  // Aggregate data by date across all channels
  const byDate = new Map<string, { views: number; premium: number; revenue: number }>();
  (data || []).forEach(r => {
    const key = r.date;
    const prev = byDate.get(key) || { views: 0, premium: 0, revenue: 0 };
    prev.views += Number(r.total_views || 0);
    prev.premium += Number(r.total_premium_views || 0);
    prev.revenue += Number(r.total_revenue || 0);
    byDate.set(key, prev);
  });

  const rows = Array.from(byDate.entries()).map(([date, v]) => ({
    date,
    views: v.views,
    premium: v.premium,
    revenue: v.revenue,
  }));

  console.log('📊 Processed analytics rows:', rows);

  return { split, rows };
}

const Analytics = () => {
  const { user } = useAuth();
  const [showReferred, setShowReferred] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date('2025-05-05'), // Set to May 5th for testing
    end: new Date('2025-05-05'),   // Set to May 5th for testing
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [splitPercent, setSplitPercent] = useState<number>(100);
  const [videoData, setVideoData] = useState<any[]>([]);

  // Load channels on component mount (when user available)
  useEffect(() => {
    if (user?.id) {
      console.log('🚀 User authenticated, loading channels for:', user.id);
      loadChannels();
    } else {
      console.log('⚠️ No user ID available');
    }
  }, [user?.id]);

  // Load split percent for logged-in user
  useEffect(() => {
    const loadSplit = async () => {
      try {
        if (!user?.id) return;
        const { data, error } = await supabase
          .from("user_requests")
          .select("split_percent")
          .eq("user_id", user.id)
          .single();
        if (!error && data?.split_percent !== undefined && data?.split_percent !== null) {
          setSplitPercent(Number(data.split_percent));
        } else {
          setSplitPercent(100);
        }
      } catch (e) {
        setSplitPercent(100);
      }
    };
    loadSplit();
  }, [user?.id]);

  // Load analytics data when date range, channel, or split changes
  useEffect(() => {
    loadAnalyticsData();
    loadVideoData();
  }, [dateRange, selectedChannel, splitPercent]);

  const loadChannels = async () => {
    try {
      if (!user?.id) return;
      console.log('🔄 loadChannels called for user:', user.id);
      
      // Get user channels using the same logic as channel management
      const { channels } = await getUserChannels(user.id);
      console.log('📊 loadChannels received:', { channels });
      
      // Convert to ChannelInfo format for the dropdown
      const channelInfos: ChannelInfo[] = channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        status: channel.status,
        thumbnail: channel.thumbnail,
        registration_date: channel.registration_date,
        approval_date: channel.approval_date,
      }));
      
      console.log('🎯 Final channelInfos for dropdown:', channelInfos);
      
      // If no channels found, show a message but don't break
      if (channelInfos.length === 0) {
        console.log('⚠️ No channels found for user, setting empty array');
        toast('No channels available for analytics', { icon: 'ℹ️' });
      }
      
      setChannels(channelInfos);
    } catch (error) {
      console.error('❌ Failed to load channels:', error);
      toast.error('Failed to load channels');
    }
  };

  const loadVideoData = async () => {
    try {
      if (!user?.id) return;
      console.log('🎬 loadVideoData called for user:', user.id);
      
      // Get user channels to get their analytics CIDs
      const { channels } = await getUserChannels(user.id);
      const analyticsCids = channels
        .map(c => c.analyticsCid)
        .filter(Boolean) as string[];
      
      console.log('🎯 Analytics CIDs for video data:', analyticsCids);
      
      if (analyticsCids.length === 0) {
        console.log('⚠️ No analytics CIDs found, setting empty video data');
        setVideoData([]);
        return;
      }

      // Get date range for filtering
      const startStr = dateRange.start.toLocaleDateString('en-CA');
      const endStr = dateRange.end.toLocaleDateString('en-CA');
      
      // 1. Get video metadata from analytics_videos
      const { data: videos, error: videosError } = await supabase
        .from('analytics_videos')
        .select('vname, vthumbnail, cid')
        .in('cid', analyticsCids);

      if (videosError) {
        console.error('❌ Error fetching analytics_videos:', videosError);
        setVideoData([]);
        return;
      }

      console.log('📹 Videos metadata:', videos);

      // 2. Get performance data from daily_video_analytics
      console.log('🔍 Querying daily_video_analytics with:', {
        cids: analyticsCids,
        startDate: startStr,
        endDate: endStr
      });
      
      // First, let's see what tables exist and what the structure looks like
      console.log('🔍 Available tables in schema:');
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%video%');
      console.log('📋 Video-related tables:', tables);
      
      let performance: any[] = [];
      let performanceError: any = null;
      
      // Try daily_video_analytics first
      try {
        const result = await supabase
          .from('daily_video_analytics')
          .select('cid, total_views, total_revenue, date')
          .in('cid', analyticsCids)
          .gte('date', startStr)
          .lte('date', endStr);
        
        performance = result.data || [];
        performanceError = result.error;
        
        if (performanceError) {
          console.log('⚠️ daily_video_analytics failed, trying alternative...');
          
          // Try daily_video_analytics with different column names
          const result2 = await supabase
            .from('daily_video_analytics')
            .select('*')
            .limit(1);
          
          if (result2.data && result2.data.length > 0) {
            console.log('📋 daily_video_analytics structure:', Object.keys(result2.data[0]));
          }
        }
      } catch (e) {
        console.error('❌ Exception querying daily_video_analytics:', e);
      }

      if (performanceError) {
        console.error('❌ Error fetching daily_video_analytics:', performanceError);
        console.error('❌ Error details:', {
          code: performanceError.code,
          message: performanceError.message,
          details: performanceError.details
        });
        // Continue with just video metadata
      }

      console.log('📊 Video performance data:', performance);
      console.log('📊 Performance data type:', typeof performance);
      console.log('📊 Performance data length:', performance?.length);
      if (performance && performance.length > 0) {
        console.log('📊 First performance record:', performance[0]);
        console.log('📊 First record keys:', Object.keys(performance[0]));
      }

      // 3. Combine video metadata with performance data
      const combinedVideoData = videos.map(video => {
        const perf = performance?.find(p => p.cid === video.cid);
        
        console.log(`🎬 Processing video ${video.vname}:`, {
          videoCid: video.cid,
          perfData: perf,
          perfViews: perf?.total_views,
          perfRevenue: perf?.total_revenue
        });
        
        // Ensure we have valid numbers and handle NaN/undefined
        const views = safeNumericConversion(perf?.total_views);
        const revenue = safeNumericConversion(perf?.total_revenue);
        
        console.log(`🎬 Converted values for ${video.vname}:`, {
          rawViews: perf?.total_views,
          rawRevenue: perf?.total_revenue,
          rawRevenueType: typeof perf?.total_revenue,
          views,
          revenue,
          viewsType: typeof views,
          revenueType: typeof revenue,
          viewsIsNaN: isNaN(views),
          revenueIsNaN: isNaN(revenue)
        });
        
        // Calculate RPM safely to avoid NaN
        let rpm = 0;
        if (views > 0 && revenue > 0) {
          rpm = (revenue * 1000) / views;
        }
        
        const result = {
          id: video.cid,
          title: video.vname || 'Unknown Video',
          thumbnail: video.vthumbnail || '',
          views: views,
          revenue: revenue,
          rpm: rpm,
          cid: video.cid
        };
        
        console.log(`🎬 Final result for ${video.vname}:`, result);
        return result;
      });

      console.log('🎬 Final combined video data:', combinedVideoData);
      setVideoData(combinedVideoData);
      
    } catch (error) {
      console.error('❌ Failed to load video data:', error);
      setVideoData([]);
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user?.id) return;
      
      // Fix timezone issue by using local date instead of ISO string
      const startStr = dateRange.start.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      const endStr = dateRange.end.toLocaleDateString('en-CA');     // Returns YYYY-MM-DD format

      console.log('Requesting analytics for date range:', {
        start: startStr,
        end: endStr,
        channel: selectedChannel,
        splitPercent,
      });

      // Fetch data directly from Supabase
      const { split, rows } = await fetchDaily(user.id, startStr, endStr, selectedChannel);

      const adjusted = applySplit(rows, split);

      // Shape into AnalyticsData for charts/cards
      const dailyData = adjusted.map(d => ({
        date: d.date,
        views: d.views,
        premiumViews: d.premium,
        rpm: d.views > 0 ? Math.round(((d.revenue * 1000) / d.views) * 1000) / 1000 : 0,
        revenue: d.revenue,
        hasData: true,
        dataSize: 0,
      }));

      const totalViews = dailyData.reduce((s, x) => s + x.views, 0);
      const totalPremiumViews = dailyData.reduce((s, x) => s + (x.premiumViews || 0), 0);
      const totalRevenue = dailyData.reduce((s, x) => s + x.revenue, 0);
      const averageRPM = totalViews > 0 ? (totalRevenue * 1000) / totalViews : 0;

      const shaped: AnalyticsData = {
        success: true,
        dateRange: {
          start: startStr,
          end: endStr,
          days: dailyData.length,
          startFormatted: dateRange.start.toLocaleDateString(),
          endFormatted: dateRange.end.toLocaleDateString(),
        },
        channel: selectedChannel === "all" ? "all" : String(selectedChannel),
        dailyData,
        summary: {
          totalViews,
          totalPremiumViews,
          totalRevenue,
          averageRPM,
          dataPoints: dailyData.length,
          dataAvailability: 100,
          errors: 0,
          successRate: 100,
        },
        status: "completed",
        progress: 100,
        notice: "",
        implementation: "supabase",
      };

      setAnalyticsData(shaped);
      console.log('Analytics data (split applied) loaded successfully:', shaped);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize animations after component mounts
    const cleanup = initSectionAnimations();

    // Re-init animations when loading state changes
    const timer = setTimeout(() => {
      cleanup?.(); // Clean up previous animations
      initSectionAnimations();
    }, 1600);

    return () => {
      clearTimeout(timer);
      cleanup?.(); // Clean up animations when component unmounts
    };
  }, [isLoading]);

  const handleChannelChange = async (channel: string) => {
    // Validate channel access if not "all"
    if (channel !== "all") {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }
      
      // Check if the channel is in the user's available channels
      const userChannels = await getUserChannels(user.id);
      const hasAccess = userChannels.channels.some(c => c.id === channel);
      
      if (!hasAccess) {
        toast.error('You do not have access to this channel');
        return;
      }
    }
    
    setSelectedChannel(channel);
    setShowReferred(channel === "all");
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleVideoSearch = async (query: string) => {
    setIsSearching(true);
    console.log("Searching for video:", query);
    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSearching(false);
  };

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Helper function to format currency with proper decimal handling
  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || amount === 0) {
      return '$0.00';
    }
    
    // For very small amounts, show more decimal places
    if (amount < 0.01) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(amount);
    }
    
    // For regular amounts, show 2 decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to format RPM with proper decimal handling
  const formatRPM = (rpm: number): string => {
    if (isNaN(rpm) || rpm === 0) {
      return '$0.00';
    }
    
    // For very small RPM values, show more decimal places
    if (rpm < 0.01) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(rpm);
    }
    
    // For regular RPM values, show 2 decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rpm);
  };

  // Helper function to safely convert Supabase numeric data
  const safeNumericConversion = (value: any): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    
    // If it's already a number, return it
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // For other types, convert to string first
    try {
      const parsed = parseFloat(String(value));
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  // Get analytics summary data
  const getAnalyticsSummary = () => {
    if (!analyticsData) {
      return {
        totalViews: 0,
        totalPremiumViews: 0,
        totalRevenue: 0,
        averageRPM: 0,
      };
    }

    return {
      totalViews: analyticsData.summary.totalViews,
      totalPremiumViews: analyticsData.summary.totalPremiumViews,
      totalRevenue: analyticsData.summary.totalRevenue,
      averageRPM: analyticsData.summary.averageRPM,
    };
  };

  const summary = getAnalyticsSummary();

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
      <FadeInUp>
        <Header />

        <AnalyticsControls
          onChannelChange={handleChannelChange}
          onDateRangeChange={handleDateRangeChange}
          channels={channels}
          selectedChannel={selectedChannel}
          currentDateRange={dateRange}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-3 animate-section">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
                <p className="text-sm">{error}</p>
                <button 
                  onClick={loadAnalyticsData}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Total Views */}
              <MetricCard
                title="Views"
                value={formatNumber(summary.totalViews)}
                previousLabel="Previous period"
                previousValue={showReferred ? "55M" : "42M"}
                change={7.3}
                changeColor="text-green-500"
                isLoading={isLoading}
              />

              {/* Premium Views */}
              <MetricCard
                title="Premium Views"
                value={formatNumber(summary.totalPremiumViews)}
                previousLabel="Previous period"
                previousValue={showReferred ? "6.12M" : "4.82M"}
                change={8.2}
                changeColor="text-green-500"
                isLoading={isLoading}
              />

              {/* RPM */}
              <MetricCard
                title="RPM"
                value={formatRPM(summary.averageRPM)}
                previousLabel="Previous period"
                previousValue={showReferred ? "$0.12" : "$0.10"}
                change={8.3}
                changeColor="text-green-500"
                isLoading={isLoading}
              />

              {/* Expected Revenue */}
              <MetricCard
                title="Expected Revenue"
                value={formatCurrency(summary.totalRevenue)}
                previousLabel="Previous period"
                previousValue={showReferred ? "$6,600" : "$4,620"}
                change={10.6}
                changeColor="text-green-500"
                isLoading={isLoading}
              />
            </div>

            {/* Revenue Analysis */}
            <div className="animate-section">
              <h2 className="text-xl font-bold mb-2">Revenue Analysis</h2>
              <RevenueChart
                startDate={dateRange.start}
                endDate={dateRange.end}
                showReferred={showReferred}
                isLoading={isLoading}
                analyticsData={analyticsData}
              />
            </div>
            <div className="animate-section">
              <VideoSearch
                onSearch={handleVideoSearch}
                isLoading={isSearching}
              />
              <VideoTable
                data={videoData}
                isLoading={isLoading || isSearching}
              />
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

export default Analytics;
