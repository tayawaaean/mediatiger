import React, { useState, useEffect } from 'react';
import { dummyAnalyticsService } from '../services/dummyAnalyticsService';
import { AnalyticsData } from '../services/analyticsService';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Activity, Target, Users } from 'lucide-react';

export default function DummyAnalyticsDemo() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date() // today
  });

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const channelId = selectedChannel === 'all' ? undefined : selectedChannel;
      const data = await dummyAnalyticsService.fetchAnalyticsRange(
        dateRange.start,
        dateRange.end,
        channelId
      );
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedChannel]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-slate-600"></div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-indigo-500" />
                <h1 className="text-2xl font-bold">Dummy Analytics Demo</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Data Source:</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm font-medium">
                Dummy Data
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Analytics Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Channel
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Channels</option>
                <option value="UCmSy2p4qeO3cr_BPCF4oSeQ">Tech Tutorials Pro</option>
                <option value="UC7TizprGknbDalbHplQtag">Creative Content Hub</option>
                <option value="UC-lHJZR3Gqxm24_Vd_AJ5Yw">Gaming Entertainment</option>
                <option value="UCX6OQ3DkcsbYNE6H8uQQuVA">Educational Insights</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : analyticsData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-400">Total Views</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.summary.totalViews)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-400">Premium Views</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.summary.totalPremiumViews)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.summary.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-400">Avg RPM</p>
                    <p className="text-2xl font-bold">${analyticsData.summary.averageRPM.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Data Chart */}
            <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Daily Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Views</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Premium Views</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">RPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.dailyData.map((day, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4">{day.date}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(day.views)}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(day.premiumViews)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(day.revenue)}</td>
                        <td className="py-3 px-4 text-right">${day.rpm.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Performance Trends */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-lg font-semibold mb-4">Performance Trends (30 days)</h2>
                <div className="space-y-3">
                  {(() => {
                    const trends = dummyAnalyticsService.generatePerformanceTrends(30);
                    const lastIndex = trends.labels.length - 1;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Views Growth:</span>
                          <span className="text-green-400">
                            +{((trends.views[lastIndex] / trends.views[0] - 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revenue Growth:</span>
                          <span className="text-green-400">
                            +{((trends.revenue[lastIndex] / trends.revenue[0] - 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {dummyAnalyticsService.generateRecentActivity().slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.description}</p>
                        <p className="text-xs text-slate-500">
                          {activity.timestamp.toLocaleDateString()} • {activity.channel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notice */}
            {analyticsData.notice && (
              <div className="mt-8 bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-300 text-sm">{analyticsData.notice}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
