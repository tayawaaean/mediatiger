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
import { analyticsService, AnalyticsData, ChannelInfo } from "../../../services/analyticsService";
import toast from "react-hot-toast";

const Analytics = () => {
  const [showReferred, setShowReferred] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 1), // Latest: yesterday
    end: subDays(new Date(), 1),   // Latest: yesterday
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  // Sample video data (keeping this for now as it's not part of the analytics API)
  const videoData = [
    {
      id: "1",
      thumbnail:
        "https://images.pexels.com/photos/2264753/pexels-photo-2264753.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      title: "Unknown Title",
      rpmGross: 0.27,
      revenueGross: 8425.65,
      views: 30840413,
    },
  ];

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Load analytics data when date range or channel changes
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedChannel]);

  const loadChannels = async () => {
    try {
      const response = await analyticsService.fetchChannels();
      if (response.success) {
        setChannels(response.channels);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
      toast.error('Failed to load channels');
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const channelId = selectedChannel === "all" ? undefined : selectedChannel;
      
      // Log the date range being requested for debugging
      console.log('Requesting analytics for date range:', {
        start: dateRange.start.toISOString().split('T')[0],
        end: dateRange.end.toISOString().split('T')[0],
        channel: channelId || 'all'
      });
      
      const data = await analyticsService.fetchAnalyticsRange(
        dateRange.start,
        dateRange.end,
        channelId
      );
      
      if (data.success) {
        setAnalyticsData(data);
        console.log('Analytics data loaded successfully:', data);
      } else {
        setError('Failed to fetch analytics data');
        console.error('Analytics API returned success: false');
      }
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

  const handleChannelChange = (channel: string) => {
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

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
                value={formatCurrency(summary.averageRPM)}
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
