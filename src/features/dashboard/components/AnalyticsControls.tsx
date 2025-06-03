import React, { useState } from 'react';
import DateRangeSelector from './DateRangeSelector';

interface AnalyticsControlsProps {
  onChannelChange: (channel: string) => void;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const AnalyticsControls: React.FC<AnalyticsControlsProps> = ({
  onChannelChange,
  onDateRangeChange,
}) => {
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChannelSelect = async (channel: string) => {
    setIsLoading(true);
    onChannelChange(channel);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
    setIsLoading(false);
    setShowChannelDropdown(false);
  };

  return (
    <div className="flex justify-between items-center px-4 py-2">
      {/* Channel Selector */}
      <div className="relative channel-dropdown-container">
        <button
          onClick={() => !isLoading && setShowChannelDropdown(!showChannelDropdown)}
          className={`bg-slate-800 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
            isLoading ? 'opacity-50 cursor-wait' : 'hover:bg-slate-700'
          }`}
          disabled={isLoading}
        >
          All Channels
          <span className="text-xs">▼</span>
        </button>
        
        {showChannelDropdown && (
          <div className="absolute left-0 mt-2 w-[280px] bg-slate-900 rounded-lg shadow-lg z-50 dropdown-animate">
            <div
              className="px-4 py-2 hover:bg-slate-700 cursor-pointer transition-all duration-200"
              onClick={() => handleChannelSelect('all')}
            >
              All Channels
            </div>
          </div>
        )}
      </div>

      {/* Date Selector */}
      <DateRangeSelector onRangeChange={onDateRangeChange} />
    </div>
  );
};

export default AnalyticsControls;