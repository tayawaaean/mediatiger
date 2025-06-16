import { subDays } from "date-fns";
import { useState, useEffect } from "react";
import AnalyticsControls from "../components/AnalyticsControls";
import Header from "../components/Header";
import MetricCard from "../components/MetricCard";
import RevenueChart from "../components/RevenueChart";
import VideoSearch from "../components/VideoSearch";
import VideoTable from "../components/VideoTable";
import { initSectionAnimations } from "../../../utils/animations";

const Analytics = () => {
  const [showReferred, setShowReferred] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 27),
    end: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Sample video data
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

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [showReferred, dateRange]);

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

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
      <Header />

      <AnalyticsControls
        onChannelChange={handleChannelChange}
        onDateRangeChange={handleDateRangeChange}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-3 animate-section">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Total Views */}
            <MetricCard
              title="Views"
              value={showReferred ? "59M" : "45M"}
              previousLabel="Previous period"
              previousValue={showReferred ? "55M" : "42M"}
              change={7.3}
              changeColor="text-green-500"
              isLoading={isLoading}
            />

            {/* Premium Views */}
            <MetricCard
              title="Premium Views"
              value={showReferred ? "6.62M" : "5.12M"}
              previousLabel="Previous period"
              previousValue={showReferred ? "6.12M" : "4.82M"}
              change={8.2}
              changeColor="text-green-500"
              isLoading={isLoading}
            />

            {/* RPM */}
            <MetricCard
              title="RPM"
              value={showReferred ? "$0.13" : "$0.11"}
              previousLabel="Previous period"
              previousValue={showReferred ? "$0.12" : "$0.10"}
              change={8.3}
              changeColor="text-green-500"
              isLoading={isLoading}
            />

            {/* Expected Revenue */}
            <MetricCard
              title="Expected Revenue"
              value={showReferred ? "$7,670" : "$5,850"}
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
            />
          </div>
          <div className="animate-section">
            <VideoSearch onSearch={handleVideoSearch} isLoading={isSearching} />
            <VideoTable data={videoData} isLoading={isLoading || isSearching} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
