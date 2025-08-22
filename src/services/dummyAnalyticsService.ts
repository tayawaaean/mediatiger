import { AnalyticsData, ChannelInfo, ChannelsResponse } from './analyticsService';
import { ANALYTICS_CONFIG } from '../config/analytics';

// Generate realistic dummy data for analytics
export class DummyAnalyticsService {
  private generateDailyData(startDate: Date, endDate: Date, channelId?: string) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyData = [];
    
    // Base values for scaling
    const baseDailyViews = ANALYTICS_CONFIG.DUMMY.BASE_DAILY_VIEWS;
    const baseDailyRevenue = ANALYTICS_CONFIG.DUMMY.BASE_DAILY_REVENUE;
    const baseRPM = ANALYTICS_CONFIG.DUMMY.BASE_RPM;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add weekly pattern (higher on weekends)
      const dayOfWeek = date.getDay();
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? ANALYTICS_CONFIG.DUMMY.WEEKEND_BOOST : 1;
      
      // Add monthly pattern (gradual increase towards end of month)
      const dayOfMonth = date.getDate();
      const monthProgress = dayOfMonth / 31;
      const monthlyTrend = 0.8 + (monthProgress * ANALYTICS_CONFIG.DUMMY.MONTHLY_GROWTH);
      
      // Random daily variation
      const dailyVariation = 0.85 + (Math.random() * ANALYTICS_CONFIG.DUMMY.DAILY_VARIATION_RANGE * 2);
      
      // Combine all factors
      const finalMultiplier = weekendMultiplier * monthlyTrend * dailyVariation;
      
      const views = Math.round(baseDailyViews * finalMultiplier);
      const premiumViews = Math.round(views * (ANALYTICS_CONFIG.DUMMY.PREMIUM_VIEWS_MIN + Math.random() * (ANALYTICS_CONFIG.DUMMY.PREMIUM_VIEWS_MAX - ANALYTICS_CONFIG.DUMMY.PREMIUM_VIEWS_MIN)));
      const rpm = baseRPM * (0.9 + Math.random() * ANALYTICS_CONFIG.DUMMY.RPM_VARIATION * 2);
      const revenue = (views * rpm) / 1000;
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        views,
        premiumViews,
        rpm: Math.round(rpm * 1000) / 1000,
        revenue: Math.round(revenue * 100) / 100,
        hasData: true,
        dataSize: Math.floor(Math.random() * 100) + 50
      });
    }
    
    return dailyData;
  }
  
  private calculateSummary(dailyData: any[]) {
    const totalViews = dailyData.reduce((sum, day) => sum + day.views, 0);
    const totalPremiumViews = dailyData.reduce((sum, day) => sum + day.premiumViews, 0);
    const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
    const averageRPM = totalViews > 0 ? (totalRevenue * 1000) / totalViews : 0;
    
    return {
      totalViews,
      totalPremiumViews,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRPM: Math.round(averageRPM * 1000) / 1000,
      dataPoints: dailyData.length,
      dataAvailability: 95 + Math.random() * 5,
      errors: Math.floor(Math.random() * 3),
      successRate: 98 + Math.random() * 2
    };
  }
  
  async fetchAnalyticsRange(
    startDate: Date,
    endDate: Date,
    channel?: string
  ): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, ANALYTICS_CONFIG.DUMMY.MIN_DELAY + Math.random() * (ANALYTICS_CONFIG.DUMMY.MAX_DELAY - ANALYTICS_CONFIG.DUMMY.MIN_DELAY)));
    
    const dailyData = this.generateDailyData(startDate, endDate, channel);
    const summary = this.calculateSummary(dailyData);
    
    return {
      success: true,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: dailyData.length,
        startFormatted: startDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        endFormatted: endDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      },
      channel: channel || 'all',
      dailyData,
      summary,
      status: 'completed',
      progress: 100,
      notice: 'Displaying sample analytics data for demonstration purposes.',
      implementation: 'dummy'
    };
  }
  
  async fetchAnalyticsForDate(
    date: Date,
    channel?: string
  ): Promise<AnalyticsData> {
    return this.fetchAnalyticsRange(date, date, channel);
  }
  
  async fetchChannels(): Promise<ChannelsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, ANALYTICS_CONFIG.DUMMY.MIN_DELAY + Math.random() * (ANALYTICS_CONFIG.DUMMY.MAX_DELAY - ANALYTICS_CONFIG.DUMMY.MIN_DELAY)));
    
    const channels: ChannelInfo[] = [
      {
        id: 'UCmSy2p4qeO3cr_BPCF4oSeQ',
        name: 'Tech Tutorials Pro',
        analytics: {
          totalViews: 45000000,
          totalRevenue: 4500,
          averageRPM: 0.10
        }
      },
      {
        id: 'UC7TizprGknbDalbHplQtag',
        name: 'Creative Content Hub',
        analytics: {
          totalViews: 32000000,
          totalRevenue: 3200,
          averageRPM: 0.10
        }
      },
      {
        id: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
        name: 'Gaming Entertainment',
        analytics: {
          totalViews: 28000000,
          totalRevenue: 2800,
          averageRPM: 0.10
        }
      },
      {
        id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
        name: 'Educational Insights',
        analytics: {
          totalViews: 22000000,
          totalRevenue: 2200,
          averageRPM: 0.10
        }
      }
    ];
    
    return {
      success: true,
      channels,
      total: channels.length
    };
  }
  
  async fetchLastNDays(days: number, channel?: string): Promise<AnalyticsData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    
    return this.fetchAnalyticsRange(startDate, endDate, channel);
  }
  
  async fetchMonthAnalytics(
    year: number,
    month: number,
    channel?: string
  ): Promise<AnalyticsData> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return this.fetchAnalyticsRange(startDate, endDate, channel);
  }
  
  // Generate performance trends data
  generatePerformanceTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const labels = [];
    const views = [];
    const engagement = [];
    const revenue = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate realistic trends with growth
      const baseViews = 1500000;
      const growthFactor = 1 + (i * 0.02); // 2% daily growth
      const dailyVariation = 0.9 + (Math.random() * 0.2);
      
      const dailyViews = Math.round(baseViews * growthFactor * dailyVariation);
      views.push(dailyViews);
      
      // Engagement rate (views to likes/comments ratio)
      const engagementRate = 0.08 + (Math.random() * 0.04); // 8-12%
      engagement.push(Math.round(dailyViews * engagementRate));
      
      // Revenue follows views pattern
      const rpm = 0.10 + (Math.random() * 0.05);
      revenue.push(Math.round((dailyViews * rpm) / 1000));
    }
    
    return { labels, views, engagement, revenue };
  }
  
  // Generate real-time performance data
  generateRealtimeData() {
    const currentViews = 1500000 + Math.floor(Math.random() * 500000);
    const last24h = currentViews * (0.8 + Math.random() * 0.4);
    const last48h = last24h * (0.9 + Math.random() * 0.2);
    const last7Days = last48h * (0.85 + Math.random() * 0.3);
    
    return {
      current: currentViews,
      last24h: Math.round(last24h),
      last48h: Math.round(last48h),
      last7Days: Math.round(last7Days)
    };
  }
  
  // Generate recent activity data
  generateRecentActivity() {
    const activities = [
      {
        id: 1,
        type: 'video_upload',
        title: 'New video uploaded',
        description: 'How to optimize your content for better engagement',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        channel: 'Tech Tutorials Pro',
        views: 15000,
        revenue: 1.50
      },
      {
        id: 2,
        type: 'revenue_milestone',
        title: 'Revenue milestone reached',
        description: 'Congratulations! You\'ve earned $100 this month',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        channel: 'Creative Content Hub',
        views: 0,
        revenue: 100
      },
      {
        id: 3,
        type: 'views_spike',
        title: 'Views spike detected',
        description: 'Your video "Advanced Tips" gained 50K views in 24h',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        channel: 'Gaming Entertainment',
        views: 50000,
        revenue: 5.00
      },
      {
        id: 4,
        type: 'channel_growth',
        title: 'Channel growth milestone',
        description: 'Your channel reached 100K subscribers!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        channel: 'Educational Insights',
        views: 0,
        revenue: 0
      }
    ];
    
    return activities;
  }
  
  // Generate goals data
  generateGoals() {
    return [
      {
        id: "1",
        title: 'Monthly Views',
        current: 45000000,
        target: 50000000,
        unit: 'views',
        color: 'text-blue-500'
      },
      {
        id: "2",
        title: 'Monthly Revenue',
        current: 4500,
        target: 5000,
        unit: 'USD',
        color: 'text-green-500'
      },
      {
        id: "3",
        title: 'Channel Growth',
        current: 4,
        target: 5,
        unit: 'channels',
        color: 'text-purple-500'
      }
    ];
  }
}

export const dummyAnalyticsService = new DummyAnalyticsService();
