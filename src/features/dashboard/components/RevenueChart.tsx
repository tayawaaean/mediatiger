import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnalyticsData } from '../../../services/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  startDate?: Date;
  endDate?: Date;
  isLoading?: boolean;
  analyticsData?: AnalyticsData | null;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  startDate = new Date('2024-09-01'),
  endDate = new Date('2025-03-07'),
  isLoading = false,
  analyticsData = null
}) => {
  if (isLoading) {
    return (
      <div className="relative h-80 w-full bg-slate-800 rounded-xl p-2 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 pulse-ring relative">
            <div className="absolute inset-0 animate-spin">
              <div className="h-2 w-2 bg-blue-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-800/50 to-transparent"></div>
      </div>
    );
  }

  // Use real analytics data if available, otherwise show empty chart
  const getChartData = () => {
    if (analyticsData && analyticsData.success && analyticsData.dailyData.length > 0) {
      // Use real analytics data
      const dates = analyticsData.dailyData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const views = analyticsData.dailyData.map(item => item.views);
      const revenue = analyticsData.dailyData.map(item => item.revenue);
      
      return { dates, views, revenue };
    } else {
      // Show empty chart when no data is available
      return { dates: [], views: [], revenue: [] };
    }
  };



  const { dates, views, revenue } = getChartData();

  // Show no data message when chart is empty
  if (dates.length === 0) {
    return (
      <div className="relative h-80 w-full bg-slate-800 rounded-xl p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-slate-400 text-sm">
            {analyticsData?.channel && analyticsData.channel !== 'all' 
              ? `No data available for the selected channel in this date range.`
              : 'No analytics data available for the selected date range.'
            }
          </p>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, isRevenue: boolean) => {
    if (isRevenue) {
      return '$' + value.toLocaleString();
    }
    return value >= 1000000 
      ? (value / 1000000).toFixed(1) + 'M'
      : value >= 1000 
        ? (value / 1000).toFixed(1) + 'K'
        : value.toString();
  };

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Views',
        data: views,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 0,
        borderWidth: 1.5
      },
      {
        label: 'Revenue',
        data: revenue,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 0,
        borderWidth: 1.5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0',
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            return label + formatValue(context.parsed.y, context.datasetIndex === 1);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
          font: {
            size: 10,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          },
          maxTicksLimit: 8
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          padding: 8,
          callback: (value: number) => formatValue(value, false),
          font: {
            size: 10,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          },
          align: 'start',
          labelOffset: -8
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          padding: 8,
          callback: (value: number) => formatValue(value, true),
          font: {
            size: 10,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          },
          align: 'start',
          labelOffset: -8
        }
      }
    }
  };

  return (
    <div className="relative h-80 w-full bg-slate-800 rounded-xl p-2">
      <Line data={data} options={options} />
    </div>
  );
};

export default RevenueChart;