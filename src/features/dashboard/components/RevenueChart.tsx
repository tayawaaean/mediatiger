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
  showReferred?: boolean;
  isLoading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  startDate = new Date('2024-09-01'),
  endDate = new Date('2025-03-07'),
  showReferred = true,
  isLoading = false
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

  const generateData = (start: Date, end: Date, includeReferred: boolean) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Base values for scaling
    const baseMonthlyViews = 59000000; // 59M views
    const baseMonthlyRevenue = 7670; // $7,670

    // Calculate daily averages
    const avgDailyViews = baseMonthlyViews / 30;
    const avgDailyRevenue = baseMonthlyRevenue / 30;

    // Generate daily data with natural variations
    const viewsBase = Array.from({ length: days }, (_, index) => {
      // Add weekly pattern (higher on weekends)
      const dayOfWeek = (index % 7);
      const weekendMultiplier = dayOfWeek >= 5 ? 1.2 : 1;
      
      // Add monthly pattern (gradual increase towards end of month)
      const dayOfMonth = index % 30;
      const monthProgress = dayOfMonth / 30;
      const monthlyTrend = 0.9 + (monthProgress * 0.2);

      // Random daily variation (±10%)
      const dailyVariation = 0.9 + (Math.random() * 0.2);

      // Combine all factors
      const finalMultiplier = weekendMultiplier * monthlyTrend * dailyVariation;
      
      return Math.round(avgDailyViews * finalMultiplier * (includeReferred ? 1 : 0.75));
    });

    // Revenue follows similar patterns but with slightly different variations
    const revenueBase = viewsBase.map(views => {
      const rpm = 0.13; // Base RPM
      const variationFactor = 0.95 + (Math.random() * 0.1); // ±5% RPM variation
      return Math.round((views * rpm * variationFactor) / 1000);
    });

    return {
      dates,
      views: viewsBase,
      revenue: revenueBase
    };
  };

  const { dates, views, revenue } = generateData(startDate, endDate, showReferred);

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