import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Video {
  id: string;
  thumbnail?: string;
  title: string;
  rpmGross: number;
  revenueGross: number;
  views: number;
}

interface VideoTableProps {
  data: Video[];
  isLoading?: boolean;
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

const VideoTable: React.FC<VideoTableProps> = ({ data, isLoading = false }) => {
  const [sortField, setSortField] = useState<SortField>("views");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSorting, setIsSorting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const calculateTotals = () => {
    return data.reduce(
      (acc, video) => ({
        rpmGross: acc.rpmGross + video.rpmGross,
        revenueGross: acc.revenueGross + video.revenueGross,
        views: acc.views + video.views,
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

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "title") {
      return multiplier * a.title.localeCompare(b.title);
    } else {
      // For non-title fields, sort by views (most viewed first)
      return -1 * (a.views - b.views);
    }
  });

  const totals = calculateTotals();
  const avgRpmGross =
    totals.views > 0 ? (totals.revenueGross / totals.views) * 1000 : 0;

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
                    VIDEO
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
                  {formatCurrency(avgRpmGross)}
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
                      <div className="flex items-center gap-3">
                        {video.thumbnail && (
                          <img
                            src={video.thumbnail}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                          {video.title}
                        </span>
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
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span>Total</span>
            <span>RPM: {formatCurrency(avgRpmGross)}</span>
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
              <div className="flex items-center gap-3 mb-2">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                  {video.title}
                </span>
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
