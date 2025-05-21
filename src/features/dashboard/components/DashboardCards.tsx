import React from 'react';
import { Eye, Play, Shield } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext'; // Adjust path as needed

interface DashboardCardsProps {
  monthlyViews: number;
  linkedChannels: number;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
                                                                monthlyViews,
                                                                linkedChannels,
                                                              }) => {
  // Get translate function from language context
  const { translate, currentLanguage } = useLanguage();

  // Get current month in the user's selected language
  const currentMonth = new Date().toLocaleString(currentLanguage.code, { month: "long" });

  return (
      <div className="cards-dashboard grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 relative z-[1] mb-2">
        {/* Views Card */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl hover:shadow-indigo-500/10 transform hover:scale-105 transition-all duration-300 relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-indigo-500/5 opacity-50"></div>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-300">
              <Eye className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">
                {currentMonth} {translate("dashboard.cards.views")}
              </p>
              <p className="text-2xl font-semibold text-white">
                {monthlyViews.toLocaleString(currentLanguage.code)}
              </p>
            </div>
          </div>
        </div>

        {/* Channels Card */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl hover:shadow-green-500/10 transform hover:scale-105 transition-all duration-300 relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-50"></div>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
              <Play className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">
                {translate("dashboard.cards.activeChannels")}
              </p>
              <p className="text-2xl font-semibold text-white">
                {linkedChannels.toLocaleString(currentLanguage.code)}
              </p>
            </div>
          </div>
        </div>

        {/* Rights Card */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl hover:shadow-purple-500/10 transform hover:scale-105 transition-all duration-300 relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-50"></div>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-400">
                {translate("dashboard.cards.revenue")}
              </p>
              <p className="text-2xl font-semibold text-white whitespace-nowrap">
                {new Intl.NumberFormat(currentLanguage.code, {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(156000)}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};