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
      .eq('user_id', userId)
      .eq('status', 'approved');

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
  
  console.log('🔍 applySplit debug:', {
    split,
    factor,
    inputData: data.map(d => ({ date: d.date, views: d.views, revenue: d.revenue })),
    splitPercent: split
  });
  
  const result = data.map(d => {
    // Keep views and revenue ORIGINAL (unaffected by split)
    // Only RPM will be calculated using the split-adjusted values
    const adjustedViews = d.views; // Keep original views
    const adjustedPremium = d.premium; // Keep original premium views
    const adjustedRevenue = d.revenue; // Keep original revenue
    
    console.log(`🔍 Split calculation for ${d.date}:`, {
      original: { views: d.views, revenue: d.revenue },
      factor,
      adjusted: { views: adjustedViews, revenue: adjustedRevenue },
      note: 'Views and revenue kept original, only RPM will be affected by split'
    });
    
    return {
    date: d.date,
      views: adjustedViews,
      premium: adjustedPremium,
      revenue: adjustedRevenue,
    };
  });
  
  console.log('🔍 applySplit result:', result);
  return result;
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
  console.log('🔍 Querying daily_channel_analytics with:', {
    table: 'daily_channel_analytics',
    targetCids,
    startDate: start,
    endDate: end,
    columns: 'date, total_views, total_premium_views, total_revenue, cid'
  });
  
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
  
  // Debug revenue column specifically
  if (data && data.length > 0) {
    console.log('🔍 Revenue column analysis:', data.map(record => ({
      date: record.date,
      cid: record.cid,
      total_revenue: record.total_revenue,
      revenueType: typeof record.total_revenue,
      revenueIsNull: record.total_revenue === null,
      revenueIsUndefined: record.total_revenue === undefined,
      revenueIsNaN: isNaN(Number(record.total_revenue)),
      rawRevenue: record.total_revenue
    })));
  } else {
    console.log('⚠️ No data returned from daily_channel_analytics');
  }

  // Aggregate data by date across all channels
  const byDate = new Map<string, { views: number; premium: number; revenue: number }>();
  (data || []).forEach(r => {
    const key = r.date;
    const prev = byDate.get(key) || { views: 0, premium: 0, revenue: 0 };
    
    // Debug each record
    console.log(`📊 Processing record for ${r.date}:`, {
      cid: r.cid,
      total_views: r.total_views,
      total_premium_views: r.total_premium_views,
      total_revenue: r.total_revenue,
      revenueType: typeof r.total_revenue,
      revenueIsNaN: isNaN(Number(r.total_revenue))
    });
    
    const viewsValue = Number(r.total_views || 0);
    const premiumValue = Number(r.total_premium_views || 0);
    const revenueValue = Number(r.total_revenue || 0);
    
    console.log(`📊 Aggregating for ${r.date}:`, {
      views: { raw: r.total_views, converted: viewsValue },
      premium: { raw: r.total_premium_views, converted: premiumValue },
      revenue: { raw: r.total_revenue, converted: revenueValue, type: typeof r.total_revenue }
    });
    
    prev.views += viewsValue;
    prev.premium += premiumValue;
    prev.revenue += revenueValue;
    byDate.set(key, prev);
  });

  const rows = Array.from(byDate.entries()).map(([date, v]) => ({
    date,
    views: v.views,
    premium: v.premium,
    revenue: v.revenue,
  }));

  console.log('📊 Processed analytics rows:', rows);
  console.log('📊 Final rows with revenue details:', rows.map(r => ({
    date: r.date,
    views: r.views,
    premium: r.premium,
    revenue: r.revenue,
    revenueType: typeof r.revenue,
    revenueIsNaN: isNaN(r.revenue),
    rpmCalculation: r.views > 0 ? `(${r.revenue} / ${r.views}) * 1000 = ${((r.revenue / r.views) * 1000).toFixed(4)}` : 'N/A'
  })));
  
  // Check if revenue is actually 0 or if there's a data issue
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  console.log('🔍 Revenue summary check:', {
    totalRevenue,
    totalViews,
    revenueIsZero: totalRevenue === 0,
    viewsIsZero: totalViews === 0,
    expectedRPM: totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0
  });

  return { split, rows };
}

const Analytics = () => {
  const { user } = useAuth();

  // Initialize date range to yesterday (latest date minus 1 day) to avoid timezone issues
  const getYesterdayDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
  };

  const [dateRange, setDateRange] = useState({
    start: getYesterdayDate(), // Yesterday to avoid timezone issues
    end: getYesterdayDate(),   // Yesterday to avoid timezone issues
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
        
        console.log('🔍 Loading split for current user:', user.id);
        
        const { data, error } = await supabase
          .from("user_requests")
          .select("split_percent")
          .eq("user_id", user.id)
          .single();
          
        console.log('📊 Current user split data:', { data, error, split_percent: data?.split_percent });
        
        if (!error && data?.split_percent !== undefined && data?.split_percent !== null) {
          const splitValue = Number(data.split_percent);
          if (!isNaN(splitValue) && splitValue >= 0 && splitValue <= 100) {
            console.log('✅ Setting current user split to:', splitValue);
            setSplitPercent(splitValue);
        } else {
            console.log('⚠️ Invalid split value for current user, defaulting to 100:', splitValue);
            setSplitPercent(100);
          }
        } else {
          console.log('❌ No split data for current user, defaulting to 100');
          setSplitPercent(100);
        }
      } catch (e) {
        console.error('❌ Error loading split for current user:', e);
        setSplitPercent(100);
      }
    };
    loadSplit();
  }, [user?.id]);

  // Load analytics data when date range, channel, or split changes
  useEffect(() => {
    console.log('📅 Date range changed:', {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
      startFormatted: dateRange.start.toLocaleDateString(),
      endFormatted: dateRange.end.toLocaleDateString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      note: 'Using yesterday to avoid timezone issues with data fetching'
    });
    
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
      console.log('🎬 loadVideoData called for user:', user.id, 'selected channel:', selectedChannel);
      
      // Get user channels to get their analytics CIDs
      const { channels } = await getUserChannels(user.id);
      
      // 🎯 CHANNEL FILTERING LOGIC:
      // - If "all" is selected: show videos from all user channels
      // - If specific channel is selected: show videos only from that channel
      // - This ensures video data matches the selected channel in the main analytics
      let targetChannels = channels;
      if (selectedChannel && selectedChannel !== "all") {
        // Find the specific selected channel
        const selectedChannelInfo = channels.find(c => c.id === selectedChannel);
        if (selectedChannelInfo) {
          targetChannels = [selectedChannelInfo];
          console.log('🎯 Filtering to selected channel:', selectedChannelInfo.name);
        } else {
          console.log('⚠️ Selected channel not found, showing all channels');
        }
      } else {
        console.log('🎯 Showing all channels (selectedChannel is "all")');
      }
      
      const analyticsCids = targetChannels
        .map(c => c.analyticsCid)
        .filter(Boolean) as string[];
      
      console.log('🎯 Analytics CIDs for video data (filtered):', analyticsCids);
      
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
        .select('vid, vname, vthumbnail, cid')
        .in('cid', analyticsCids);

      if (videosError) {
        console.error('❌ Error fetching analytics_videos:', videosError);
        setVideoData([]);
        return;
      }
      
      // Check if no videos found for the selected channel
      if (!videos || videos.length === 0) {
        console.log('⚠️ No videos found for selected channel:', selectedChannel);
        if (selectedChannel !== "all") {
          toast(`No videos found for the selected channel`, { icon: 'ℹ️' });
        }
        setVideoData([]);
        return;
      }

      console.log('📹 Videos metadata:', videos);
      console.log('🎯 Channel filtering result:', {
        selectedChannel,
        targetChannels: targetChannels.map(c => ({ id: c.id, name: c.name, analyticsCid: c.analyticsCid })),
        analyticsCids,
        videosFound: videos?.length || 0,
        videoCids: videos?.map(v => v.cid) || []
      });
      
      // Debug: Check analytics_videos structure
      if (videos && videos.length > 0) {
        console.log('📋 analytics_videos structure:', {
          columns: Object.keys(videos[0]),
          sampleVideo: videos[0]
        });
      }

      // 2. Get performance data from daily_channel_analytics (same as main analytics)
      console.log('🔍 Querying daily_channel_analytics for video data:', {
        table: 'daily_channel_analytics',
        cids: analyticsCids,
        startDate: startStr,
        endDate: endStr
      });
      
      let performance: any[] = [];
      let performanceError: any = null;
      
      try {
        const result = await supabase
          .from('daily_channel_analytics')
          .select('cid, total_views, total_revenue, date')
          .in('cid', analyticsCids)
          .gte('date', startStr)
          .lte('date', endStr);
        
        performance = result.data || [];
        performanceError = result.error;
        
              console.log('📊 daily_channel_analytics query result for video data:', {
        success: !performanceError,
        dataCount: performance?.length || 0,
        error: performanceError,
        sampleData: performance?.[0] || null
      });
      
      if (performance && performance.length > 0) {
        console.log('📊 daily_channel_analytics structure for video data:', {
          columns: Object.keys(performance[0]),
          sampleRow: performance[0]
        });
        console.log('✅ Now using daily_channel_analytics for video data - same as main analytics!');
        }
      } catch (e) {
        console.error('❌ Exception querying daily_channel_analytics for video data:', e);
      }

      if (performanceError) {
        console.error('❌ Error fetching daily_channel_analytics for video data:', performanceError);
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

      // 3. Check if there's actual performance data for the selected date range
      // 🎯 VALIDATION: Only show videos if there's actual data for the selected date
      if (!performance || performance.length === 0) {
        console.log('⚠️ No performance data found for selected date range:', {
          startDate: startStr,
          endDate: endStr,
          selectedChannel,
          note: 'No videos should be shown when there\'s no data for the selected date'
        });
        
        setVideoData([]);
        return;
      }
      
      // 4. Use the SAME aggregation logic as main analytics for consistency
      console.log('🔍 Using same aggregation logic as main analytics for video data');
      
      // Aggregate data by date across all channels (same as main analytics)
      const byDate = new Map<string, { views: number; premium: number; revenue: number }>();
      performance.forEach(r => {
        const key = r.date;
        const prev = byDate.get(key) || { views: 0, premium: 0, revenue: 0 };
        prev.views += Number(r.total_views || 0);
        prev.premium += Number(r.total_premium_views || 0);
        prev.revenue += Number(r.total_revenue || 0);
        byDate.set(key, prev);
      });
      
      // Get the aggregated totals (same as main analytics) - WITHOUT split percentage
      // The VideoTable component will apply the split percentage
      const aggregatedTotals = Array.from(byDate.values()).reduce((acc, day) => ({
        views: acc.views + day.views,
        premium: acc.premium + day.premium,
        revenue: acc.revenue + day.revenue
      }), { views: 0, premium: 0, revenue: 0 });
      
      console.log('📊 Raw aggregated totals for video data (before split):', aggregatedTotals);
      
      // 5. Only create video data if there's actual performance data
      // 🎯 VALIDATION: Double-check that aggregated totals have actual data
      if (aggregatedTotals.views === 0 && aggregatedTotals.revenue === 0) {
        console.log('⚠️ No performance data found for selected date range - no videos should be shown');
        
        setVideoData([]);
        return;
      }
      
      // Create video data using the raw aggregated totals (no split applied here)
      // VideoTable will apply the split percentage to match main analytics
      const combinedVideoData = videos.map((video, index) => {
        // Find channel information for this video
        const channelInfo = channels.find(ch => ch.analyticsCid === video.cid);
        
        // Distribute the raw totals across videos (split will be applied by VideoTable)
        const videoCount = videos.length;
        const distributedViews = Math.floor(aggregatedTotals.views / videoCount); // Round DOWN instead of up
        const distributedRevenue = Number((aggregatedTotals.revenue / videoCount).toFixed(4));
        
        // Calculate RPM using the raw distributed values
        const rpm = safeRPMCalculation(distributedRevenue, distributedViews);
        
        const result = {
          id: video.cid,
          title: video.vname || 'Unknown Video',
          thumbnail: video.vthumbnail || '',
          views: distributedViews,
          revenue: distributedRevenue,
          rpm: rpm,
          cid: video.cid,
          // Add the properties that VideoTable expects
          rpmGross: rpm,
          revenueGross: distributedRevenue,
          // Add channel information
          channelName: channelInfo?.name || null
        };
        
        console.log(`🎬 Video ${index + 1}/${videoCount} - ${video.vname}:`, {
          rawViews: distributedViews,
          rawRevenue: distributedRevenue,
          calculatedRPM: rpm,
          channelName: channelInfo?.name,
          note: 'Split percentage will be applied by VideoTable component'
        });
        
        return result;
      });

      // Final validation: ensure all numeric values are safe
      const validatedVideoData = combinedVideoData.map(video => ({
        ...video,
        views: safeNumericConversion(video.views),
        revenue: safeNumericConversion(video.revenue),
        rpm: safeRPMCalculation(safeNumericConversion(video.revenue), safeNumericConversion(video.views))
      }));

      // Debug: Log any remaining NaN values
      const nanCheck = validatedVideoData.map(video => ({
        title: video.title,
        views: { value: video.views, isNaN: isNaN(video.views) },
        revenue: { value: video.revenue, isNaN: isNaN(video.revenue) },
        rpm: { value: video.rpm, isNaN: isNaN(video.rpm) }
      }));
      console.log('🔍 NaN Check for video data:', nanCheck);

      console.log('🎬 Final validated video data:', validatedVideoData);
      console.log('📊 Split percentage for video data:', splitPercent);
      console.log('📊 Video data will be adjusted by split percentage in VideoTable');
      
      // Debug: Compare video table vs main analytics data
      const videoTableTotalViews = validatedVideoData.reduce((sum, video) => sum + video.views, 0);
      console.log('🔍 Data comparison debug:', {
        mainAnalyticsViews: 'Will be calculated in loadAnalyticsData',
        videoTableTotalViews,
        videoTableVideoCount: validatedVideoData.length,
        splitPercent,
        expectedVideoTableViews: videoTableTotalViews,
        expectedMainAnalyticsViews: videoTableTotalViews // Should match if same data source
      });
      
      setVideoData(validatedVideoData);
      
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
      // Using yesterday's date helps ensure complete data availability regardless of timezone
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

      // 🎯 CALCULATION FLOW:
      // 1. Get ORIGINAL data (before any split)
      // 2. Calculate ORIGINAL totals from original data
      // 3. Apply split percentage to the ORIGINAL totals (Revenue50%, Views50%)
      // 4. Calculate RPM from the split-adjusted totals: RPM = (Revenue50% / Views50%) × 1000
      // 5. All values are rounded DOWN consistently using Math.floor()
      
      // Get ORIGINAL data (before split) for totals calculation
      const originalRows = rows; // Use original rows, not adjusted ones
      
      // Apply split to daily data for display
      const adjusted = applySplit(rows, split);

      // Shape into AnalyticsData for charts/cards
      // Note: We'll use the adjusted data for display, but calculate totals from original data
      const dailyData = adjusted.map((d: any) => {
        const rpm = d.views > 0 && d.revenue > 0 ? Math.floor((d.revenue / d.views) * 1000 * 100) / 100 : 0;
        
        console.log(`🔍 Daily data processing for ${d.date}:`, {
          views: d.views,
          revenue: d.revenue,
          calculatedRPM: rpm,
          rpmCalculation: d.views > 0 ? `(${d.revenue} / ${d.views}) * 1000 = ${((d.revenue / d.views) * 1000).toFixed(4)}` : 'N/A',
          note: 'Daily RPM shown here, but main RPM calculated from split-adjusted totals below'
        });
        
        return {
        date: d.date,
        views: d.views,
        premiumViews: d.premium,
          rpm: rpm,
        revenue: d.revenue,
        hasData: true,
        dataSize: 0,
        };
      });

      // Get the ORIGINAL totals (before split application) from originalRows
      const originalTotalViews = originalRows.reduce((s: number, x: any) => s + x.views, 0);
      const originalTotalPremiumViews = originalRows.reduce((s: number, x: any) => s + (x.premium || 0), 0);
      const originalTotalRevenue = originalRows.reduce((s: number, x: any) => s + x.revenue, 0);
      
      console.log('🔍 Original totals (before split):', {
        views: originalTotalViews,
        premiumViews: originalTotalPremiumViews,
        revenue: originalTotalRevenue,
        splitPercent: split
      });
      
      // Debug: Show the difference between original and adjusted data
      console.log('🔍 Data comparison:', {
        originalRows: originalRows.map((r: any) => ({ date: r.date, views: r.views, revenue: r.revenue })),
        adjustedRows: adjusted.map((r: any) => ({ date: r.date, views: r.views, revenue: r.revenue })),
        note: 'Original rows used for totals, adjusted rows used for display'
      });
      
      // Keep views and revenue ORIGINAL (unaffected by split)
      // Only RPM will be calculated using the split-adjusted values
      const totalViews = originalTotalViews; // Keep original views
      const totalPremiumViews = originalTotalPremiumViews; // Keep original premium views
      const totalRevenue = originalTotalRevenue; // Keep original revenue
      
      console.log('🔍 Split calculation verification:', {
        originalViews: originalTotalViews,
        originalRevenue: originalTotalRevenue,
        splitPercent: split,
        note: 'Views and revenue kept original, only RPM will be affected by split'
      });
      
      console.log('🔍 Final totals (views and revenue kept original):', {
        originalViews: originalTotalViews,
        originalRevenue: originalTotalRevenue,
        finalViews: totalViews,
        finalRevenue: totalRevenue,
        note: 'Views and revenue unchanged by split, only RPM calculation will reflect split'
      });
      
      // Calculate RPM using split-adjusted values for proper split representation
      // Formula: RPM = (Revenue * Split% / Views) × 1000
      const splitFactor = split / 100;
      const splitAdjustedRevenue = totalRevenue * splitFactor;
      const averageRPM = totalViews > 0 && splitAdjustedRevenue > 0 
        ? Math.floor((splitAdjustedRevenue / totalViews) * 1000 * 100) / 100  // Round DOWN to 2 decimal places
        : 0;
      
      // Verify RPM calculation with split-adjusted revenue but original views
      console.log('🔍 RPM calculation verification:', {
        formula: 'RPM = (Revenue * Split% / Views) × 1000',
        originalRevenue: totalRevenue,
        originalViews: totalViews,
        splitPercent: split,
        splitAdjustedRevenue: splitAdjustedRevenue,
        calculation: totalViews > 0 ? `(${splitAdjustedRevenue} / ${totalViews}) × 1000` : 'N/A',
        result: averageRPM,
        note: 'RPM calculated using split-adjusted revenue but original views'
      });
      
      // Debug revenue and RPM calculation
      console.log('🔍 Revenue and RPM calculation debug:', {
        dailyData: dailyData.map(d => ({ 
          date: d.date, 
          views: d.views, 
          revenue: d.revenue,
          dailyRPM: d.rpm
        })),
        totalViews,
        totalPremiumViews,
        totalRevenue,
        averageRPM,
        revenueType: typeof totalRevenue,
        revenueIsNaN: isNaN(totalRevenue),
        rpmType: typeof averageRPM,
        rpmIsNaN: isNaN(averageRPM),
        rpmCalculation: totalViews > 0 && totalRevenue > 0 
          ? `(${totalRevenue} / ${totalViews}) × 1000 = ${((totalRevenue / totalViews) * 1000).toFixed(4)}`
          : 'N/A',
        splitEffect: `Split ${split}% applied to TOTALS first, then RPM calculated from adjusted totals`,
        roundingMethod: 'All values rounded DOWN using Math.floor()',
        originalTotals: {
          views: originalTotalViews,
          revenue: originalTotalRevenue
        },
        adjustedTotals: {
          views: totalViews,
          revenue: totalRevenue
        }
      });

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
      
      // Additional RPM debugging
      console.log('🔍 Final RPM values check:', {
        summaryRPM: shaped.summary.averageRPM,
        dailyRPMs: shaped.dailyData.map(d => ({ date: d.date, rpm: d.rpm })),
        rpmDisplay: `RPM should show: $${(shaped.summary.averageRPM / 100).toFixed(2)}`,
        splitApplied: `Split ${split}% applied to TOTALS first, then RPM calculated`,
        roundingMethod: 'All values rounded DOWN consistently',
        calculationFlow: {
          step1: 'Get original totals from daily data',
          step2: `Apply split ${split}% to totals`,
          step3: 'Calculate RPM from split-adjusted totals',
          step4: 'Round DOWN all values consistently'
        }
      });
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

  // Enhanced helper function to safely convert Supabase numeric data and handle NaN
  const safeNumericConversion = (value: any): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    
    // If it's already a number, check for NaN
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Remove any non-numeric characters except decimal points and minus
      const cleaned = value.replace(/[^\d.-]/g, '');
      if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        return 0;
      }
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // For other types, convert to string first
    try {
      const stringValue = String(value);
      // Remove any non-numeric characters except decimal points and minus
      const cleaned = stringValue.replace(/[^\d.-]/g, '');
      if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        return 0;
      }
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  // Helper function to safely calculate RPM without NaN
  const safeRPMCalculation = (revenue: number, views: number): number => {
    if (views <= 0 || revenue <= 0) {
      return 0;
    }
    const rpm = (revenue * 1000) / views;
    return isNaN(rpm) ? 0 : rpm;
  };

  // Helper function to safely format currency
  const safeCurrencyFormat = (value: number): string => {
    if (isNaN(value) || value === 0) {
      return '$0.00';
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Helper function to clean and validate video data from Supabase
  const cleanVideoData = (rawData: any[]) => {
    return rawData.map(item => ({
      id: item.id || item.cid || 'unknown',
      title: item.title || item.vname || 'Unknown Video',
      thumbnail: item.thumbnail || item.vthumbnail || '',
      views: safeNumericConversion(item.views || item.total_views),
      revenue: safeNumericConversion(item.revenue || item.total_revenue),
      rpm: safeRPMCalculation(
        safeNumericConversion(item.revenue || item.total_revenue),
        safeNumericConversion(item.views || item.total_views)
      ),
      cid: item.cid || item.channel_id || ''
    }));
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
                previousValue={summary.totalViews > 0 ? formatNumber(summary.totalViews) : "No data"}
                change={summary.totalViews > 0 ? 0 : 0}
                changeColor="text-slate-400"
                isLoading={isLoading}
              />

              {/* Premium Views */}
              <MetricCard
                title="Premium Views"
                value={formatNumber(summary.totalPremiumViews)}
                previousLabel="Previous period"
                previousValue={summary.totalPremiumViews > 0 ? formatNumber(summary.totalPremiumViews) : "No data"}
                change={summary.totalPremiumViews > 0 ? 0 : 0}
                changeColor="text-slate-400"
                isLoading={isLoading}
              />

              {/* RPM */}
              <MetricCard
                title="RPM"
                value={formatRPM(summary.averageRPM)}
                previousLabel="Previous period"
                previousValue={summary.averageRPM > 0 ? formatRPM(summary.averageRPM) : "No data"}
                change={summary.averageRPM > 0 ? 0 : 0}
                changeColor="text-slate-400"
                isLoading={isLoading}
              />

              {/* Expected Revenue */}
              <MetricCard
                title="Expected Revenue"
                value={formatCurrency(summary.totalRevenue)}
                previousLabel="Previous period"
                previousValue={summary.totalRevenue > 0 ? formatCurrency(summary.totalRevenue) : "No data"}
                change={summary.totalRevenue > 0 ? 0 : 0}
                changeColor="text-slate-400"
                isLoading={isLoading}
              />
            </div>

            {/* Revenue Analysis */}
            <div className="animate-section">
              <h2 className="text-xl font-bold mb-2">Revenue Analysis</h2>
              <RevenueChart
                startDate={dateRange.start}
                endDate={dateRange.end}
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
                splitPercent={splitPercent}
              />
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

export default Analytics;
