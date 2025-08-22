import React, { useState, useEffect } from 'react';
import { shouldUseDummyData } from '../config/analytics';
import { analyticsService } from '../services/analyticsService';
import { dummyAnalyticsService } from '../services/dummyAnalyticsService';
import { AnalyticsData } from '../services/analyticsService';

/**
 * Example component showing how to use both analytics services
 * This demonstrates the pattern for switching between dummy and real data
 */
export const AnalyticsServiceExample: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'dummy' | 'real'>('dummy');

  // Determine which service to use
  const useDummyData = shouldUseDummyData();
  const currentService = useDummyData ? dummyAnalyticsService : analyticsService;

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const data = await currentService.fetchAnalyticsRange(startDate, endDate);
      setAnalyticsData(data);
      setDataSource(useDummyData ? 'dummy' : 'real');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Error</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg">
        <p className="text-slate-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Analytics Data</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Data Source:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            dataSource === 'dummy' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {dataSource === 'dummy' ? 'Dummy Data' : 'Real API'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-slate-400 text-sm mb-1">Total Views</h4>
          <p className="text-2xl font-bold text-white">
            {(analyticsData.summary.totalViews / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-slate-400 text-sm mb-1">Total Revenue</h4>
          <p className="text-2xl font-bold text-white">
            ${analyticsData.summary.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-slate-400 text-sm mb-1">Average RPM</h4>
          <p className="text-2xl font-bold text-white">
            ${analyticsData.summary.averageRPM.toFixed(3)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-slate-400 text-sm mb-2">Date Range</h4>
        <p className="text-white">
          {analyticsData.dateRange.startFormatted} - {analyticsData.dateRange.endFormatted}
          <span className="text-slate-400 ml-2">({analyticsData.dateRange.days} days)</span>
        </p>
      </div>

      {analyticsData.notice && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3">
          <p className="text-blue-300 text-sm">{analyticsData.notice}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm"
        >
          Refresh Data
        </button>
        <button 
          onClick={() => window.open('/src/config/analytics.ts', '_blank')}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm"
        >
          View Config
        </button>
      </div>
    </div>
  );
};

export default AnalyticsServiceExample;
