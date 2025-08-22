import React, { useState } from "react";
import DateRangeSelector from "./DateRangeSelector";
import { ChannelInfo } from "../../../services/analyticsService";

interface AnalyticsControlsProps {
  onChannelChange: (channel: string) => Promise<void>;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  channels: ChannelInfo[];
  selectedChannel: string;
  currentDateRange: { start: Date; end: Date };
}

const AnalyticsControls: React.FC<AnalyticsControlsProps> = ({
  onChannelChange,
  onDateRangeChange,
  channels,
  selectedChannel,
  currentDateRange,
}) => {
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChannelSelect = async (channel: string) => {
    setIsLoading(true);
    try {
      await onChannelChange(channel);
      setShowChannelDropdown(false);
    } catch (error) {
      console.error('Error changing channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedChannelName = () => {
    if (selectedChannel === "all") return "All Channels";
    const channel = channels.find(c => c.id === selectedChannel);
    return channel ? channel.name : selectedChannel;
  };

  return (
    <div className="flex justify-between items-center px-4 py-2">
      {/* Channel Selector */}
      <div
        className="relative channel-dropdown-container"
        id="analytics-channel-selector"
      >
        <button
          onClick={() =>
            !isLoading && setShowChannelDropdown(!showChannelDropdown)
          }
          className={`bg-slate-800 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
            isLoading ? "opacity-50 cursor-wait" : "hover:bg-slate-700"
          }`}
          disabled={isLoading}
        >
          {getSelectedChannelName()}
          <span className="text-xs">▼</span>
        </button>

        {showChannelDropdown && (
          <div className="absolute left-0 mt-2 w-[280px] bg-slate-900 rounded-lg shadow-lg z-50 dropdown-animate">
            <div
              className="px-4 py-2 hover:bg-slate-700 cursor-pointer transition-all duration-200"
              onClick={() => handleChannelSelect("all")}
            >
              All Channels
            </div>
            {channels.length > 0 ? (
              channels.map((channel) => (
                <div
                  key={channel.id}
                  className="px-4 py-2 hover:bg-slate-700 cursor-pointer transition-all duration-200 border-t border-slate-700/50"
                  onClick={() => handleChannelSelect(channel.id)}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={channel.thumbnail} 
                      alt={channel.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-slate-200">{channel.name}</div>
                      <div className="text-xs text-slate-400">
                        {channel.status} • Approved {new Date(channel.approval_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-400 text-sm border-t border-slate-700/50">
                No channels available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Selector */}
      <DateRangeSelector onRangeChange={onDateRangeChange} currentDateRange={currentDateRange} />
    </div>
  );
};

export default AnalyticsControls;
