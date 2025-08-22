import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Video {
  id: string;
  thumbnail?: string;
  title: string;
  rpmGross: number;
  revenueGross: number;
  views: number;
  cid?: string; // Channel ID
  channelName?: string; // Channel name
}

interface VideoTableProps {
  data: Video[];
  isLoading?: boolean;
  splitPercent?: number;
}

type SortField = "title" | "rpmGross" | "revenueGross" | "views";
type SortDirection = "asc" | "desc";

const LoadingRow = () => (
  <tr className="border-b border-slate-700/50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded bg-slate-700 animate-shimmer"></div>
        <div className="h-4 w-32 bg-slate-700 rounded animate-shimmer"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-20 bg-slate-700 rounded animate-shimmer"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-24 bg-slate-700 rounded animate-shimmer"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-20 bg-slate-700 rounded animate-shimmer"></div>
    </td>
  </tr>
);

const VideoTable: React.FC<VideoTableProps> = ({ data, isLoading = false, splitPercent = 100 }) => {
  const [sortField, setSortField] = useState<SortField>("views");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSorting, setIsSorting] = useState(false);

  const formatCurrency = (value: number) => {
    // Handle NaN and invalid values
    if (isNaN(value) || !isFinite(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    // Handle NaN and invalid values
    if (isNaN(value) || !isFinite(value)) {
      return '0';
    }
    return new Intl.NumberFormat("en-US").format(value);
  };

  // Apply split percentage to video data
  const applySplitToData = (videoData: Video[]): Video[] => {
    if (splitPercent === 100) return videoData;
    
    return videoData.map(video => {
      // Keep views and revenue ORIGINAL (unaffected by split)
      // Only RPM will be calculated using the split-adjusted values
      const adjustedViews = video.views; // Keep original views
      const adjustedRevenue = video.revenueGross; // Keep original revenue
      
      // Calculate RPM using split-adjusted values for proper split representation
      // Formula: RPM = (Revenue * Split% / Views) × 1000
      const splitFactor = splitPercent / 100;
      const splitAdjustedRevenue = adjustedRevenue * splitFactor;
      const adjustedRpm = adjustedViews > 0 
        ? Math.floor((splitAdjustedRevenue / adjustedViews) * 1000 * 100) / 100  // Round down to 2 decimal places
        : 0;
      
      return {
        ...video,
        views: adjustedViews,
        revenueGross: adjustedRevenue,
        rpmGross: adjustedRpm
      };
    });
  };

  const calculateTotals = () => {
    // Use adjusted data for totals calculation
    return adjustedData.reduce(
      (acc, video) => ({
        rpmGross: acc.rpmGross + (isNaN(video.rpmGross) ? 0 : video.rpmGross),
        revenueGross: acc.revenueGross + (isNaN(video.revenueGross) ? 0 : video.revenueGross),
        views: acc.views + (isNaN(video.views) ? 0 : video.views),
      }),
      {
        rpmGross: 0,
        revenueGross: 0,
        views: 0,
      }
    );
  };

  const handleSort = async (field: SortField) => {
    setIsSorting(true);
    if (sortField === field) {
      // For video title, toggle direction. For others, always sort by most viewed first
      if (field === "title") {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      }
    } else {
      setSortField(field);
      // For video title, start with asc, for others use desc (most viewed first)
      setSortDirection(field === "title" ? "asc" : "desc");
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    setIsSorting(false);
  };

  const getSortIcon = (field: SortField) => {
    if (field === "title") {
      if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5" />;
      return sortDirection === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5" />
      );
    }
    return null;
  };

  // Apply split percentage to data before sorting
  const adjustedData = applySplitToData(data);
  
  // Debug RPM calculations
  if (splitPercent !== 100 && adjustedData.length > 0) {
    console.log('🔍 RPM calculation debug:', {
      splitPercent,
      sampleVideo: {
        original: {
          views: data[0]?.views,
          revenue: data[0]?.revenueGross,
          rpm: data[0]?.rpmGross
        },
        adjusted: {
          views: adjustedData[0]?.views,
          revenue: adjustedData[0]?.revenueGross,
          rpm: adjustedData[0]?.rpmGross
        },
        note: 'Views and revenue kept original, only RPM affected by split',
        rpmCalculation: adjustedData[0]?.views > 0 
          ? `(${adjustedData[0]?.revenueGross * (splitPercent / 100)} / ${adjustedData[0]?.views}) * 1000 = ${((adjustedData[0]?.revenueGross * (splitPercent / 100)) / adjustedData[0]?.views * 1000).toFixed(4)}`
          : 'N/A'
      }
    });
  }
  
  const sortedData = [...adjustedData].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "title") {
      return multiplier * a.title.localeCompare(b.title);
    } else {
      // For non-title fields, sort by views (most viewed first)
      return -1 * (a.views - b.views);
    }
  });

  const totals = calculateTotals();
  
  // Calculate average RPM using the correct formula and round down
  const avgRpmGross = totals.views > 0 
    ? Math.floor((totals.revenueGross / totals.views) * 1000 * 100) / 100  // Round down to 2 decimal places
    : 0;
  
  // Add split percentage indicator
  const splitIndicator = splitPercent !== 100 ? ` (${splitPercent}% split)` : '';
  
  // Ensure avgRpmGross is not NaN
  const safeAvgRpmGross = isNaN(avgRpmGross) ? 0 : avgRpmGross;

  return (
    <div className="mt-6 bg-slate-800/50 rounded-lg overflow-hidden">
      {/* Table for md and up */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">
                                        <button
                       onClick={() => handleSort("title")}
                       className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                       disabled={isLoading || isSorting}
                     >
                       VIDEO & CHANNEL{splitIndicator}
                       <span
                         className={
                           isSorting && sortField === "title" ? "animate-spin" : ""
                         }
                       >
                         {getSortIcon("title")}
                       </span>
                     </button>
                 </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">
                  <button
                    onClick={() => handleSort("rpmGross")}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    disabled={isLoading || isSorting}
                  >
                    RPM
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">
                  <button
                    onClick={() => handleSort("revenueGross")}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    disabled={isLoading || isSorting}
                  >
                    REVENUE
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">
                  <button
                    onClick={() => handleSort("views")}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    disabled={isLoading || isSorting}
                  >
                    VIEWS
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className={isLoading ? "opacity-50" : ""}>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <td className="px-6 py-4 text-sm font-semibold">Total</td>
                <td className="px-6 py-4 text-left text-sm">
                  {formatCurrency(safeAvgRpmGross)}
                </td>
                <td className="px-6 py-4 text-left text-sm">
                  {formatCurrency(totals.revenueGross)}
                </td>
                <td className="px-6 py-4 text-left text-sm">
                  {formatNumber(totals.views)}
                </td>
              </tr>
              {isLoading ? (
                <>
                  <LoadingRow />
                  <LoadingRow />
                  <LoadingRow />
                </>
              ) : (
                sortedData.map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                                         <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                         <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                           {video.title}
                         </span>
                         {video.channelName && (
                           <span className="text-xs text-slate-400">
                             📺 {video.channelName}
                           </span>
                         )}
                         {video.cid && !video.channelName && (
                           <span className="text-xs text-slate-400">
                             🆔 {video.cid.slice(0, 8)}...
                           </span>
                         )}
                       </div>
                     </td>
                    <td className="px-6 py-4 text-left text-sm">
                      {formatCurrency(video.rpmGross)}
                    </td>
                    <td className="px-6 py-4 text-left text-sm">
                      {formatCurrency(video.revenueGross)}
                    </td>
                    <td className="px-6 py-4 text-left text-sm">
                      {formatNumber(video.views)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Card layout for mobile */}
      <div className="block md:hidden">
                 {/* Total row as card */}
         <div className="bg-slate-800/30 border-b border-slate-700/50 p-4 flex flex-col gap-2">
           {splitPercent !== 100 && (
             <div className="text-xs text-slate-400 text-center mb-2">
               📊 Showing {splitPercent}% split adjusted data
             </div>
           )}
           <div className="flex justify-between text-xs text-slate-400 font-semibold">
             <span>Total</span>
             <span>RPM: {formatCurrency(safeAvgRpmGross)}</span>
           </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Revenue: {formatCurrency(totals.revenueGross)}</span>
            <span>Views: {formatNumber(totals.views)}</span>
          </div>
        </div>
        {isLoading ? (
          <>
            <div className="p-4 border-b border-slate-700/50">Loading...</div>
            <div className="p-4 border-b border-slate-700/50">Loading...</div>
            <div className="p-4 border-b border-slate-700/50">Loading...</div>
          </>
        ) : (
          sortedData.map((video) => (
                         <div
               key={video.id}
               className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors p-4 flex flex-col gap-2"
             >
               <div className="flex flex-col gap-1 mb-2">
                 <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                   {video.title}
                 </span>
                 {video.channelName && (
                   <span className="text-xs text-slate-400">
                     📺 {video.channelName}
                   </span>
                 )}
                 {video.cid && !video.channelName && (
                   <span className="text-xs text-slate-400">
                     🆔 {video.cid.slice(0, 8)}...
                   </span>
                 )}
               </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span>
                  <span className="font-semibold">RPM:</span>{" "}
                  {formatCurrency(video.rpmGross)}
                </span>
                <span>
                  <span className="font-semibold">Revenue:</span>{" "}
                  {formatCurrency(video.revenueGross)}
                </span>
                <span>
                  <span className="font-semibold">Views:</span>{" "}
                  {formatNumber(video.views)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoTable;
