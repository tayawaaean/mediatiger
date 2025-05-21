import React from "react";
import { Activity, Eye, BarChart2, Calendar } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext"; // Update path as needed

interface RealtimePerformanceProps {
  realtimeViews: {
    current: number;
    last24h: number;
    last48h: number;
    last7Days: number;
  };
}

export const RealtimePerformance: React.FC<RealtimePerformanceProps> = ({
                                                                          realtimeViews,
                                                                        }) => {
  // Get language translation functions
  const { translate, currentLanguage } = useLanguage();

  // Format numbers based on user's language
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(currentLanguage.code).format(num);
  };

  return (
      <div className="col-span-full bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 text-indigo-400 mr-2 animate-pulse" />
          {translate("performance.realtimePerformance")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="realtime-card wave-animation bg-gradient-to-br from-slate-700/50 via-slate-700/40 to-slate-700/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">{translate("performance.last24Hours")}</span>
              <Eye className="h-4 w-4 text-green-400 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(realtimeViews.last24h)}
            </p>
            <p className="text-sm text-slate-400">{translate("performance.totalViewsPast24h")}</p>
          </div>
          <div className="realtime-card wave-animation bg-gradient-to-br from-slate-700/50 via-slate-700/40 to-slate-700/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">{translate("performance.last48Hours")}</span>
              <BarChart2 className="h-4 w-4 text-blue-400 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(realtimeViews.last48h)}
            </p>
            <p className="text-sm text-slate-400">{translate("performance.totalViewsPast48h")}</p>
          </div>
          <div className="realtime-card wave-animation bg-gradient-to-br from-slate-700/50 via-slate-700/40 to-slate-700/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">{translate("performance.last7Days")}</span>
              <Calendar className="h-4 w-4 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(realtimeViews.last7Days)}
            </p>
            <p className="text-sm text-slate-400">{translate("performance.totalViewsPast7Days")}</p>
          </div>
        </div>
      </div>
  );
};