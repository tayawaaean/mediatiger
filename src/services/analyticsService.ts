import axios from 'axios';

export interface AnalyticsData {
  success: boolean;
  dateRange: {
    start: string;
    end: string;
    days: number;
    startFormatted: string;
    endFormatted: string;
  };
  channel: string;
  dailyData: Array<{
    date: string;
    views: number;
    premiumViews: number;
    rpm: number;
    premiumRpm?: number;
    revenue: number;
    hasData: boolean;
    dataSize: number;
  }>;
  summary: {
    totalViews: number;
    totalPremiumViews: number;
    totalRevenue: number;
    averageRPM: number;
    premiumRPM?: number;
    dataPoints: number;
    dataAvailability: number;
    errors: number;
    successRate: number;
  };
  status: string;
  progress: number;
  notice: string;
  implementation: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
  status: string;
  thumbnail: string;
  registration_date: string;
  approval_date: string;
}

export interface ChannelsResponse {
  success: boolean;
  channels: ChannelInfo[];
  total: number;
  message: string;
}

class AnalyticsService {
  private baseURL: string;
  private directURL: string;

  constructor() {
    // Try proxy first, fallback to direct URL
    this.baseURL = '/apis';
    this.directURL = 'http://18.142.174.87:3001';
  }

  /**
   * Fetch analytics data for a specific date range and channel
   */
  async fetchAnalyticsRange(
    startDate: Date,
    endDate: Date,
    channel?: string
  ): Promise<AnalyticsData> {
    try {
      const params = new URLSearchParams({
        start_date: this.formatDate(startDate),
        end_date: this.formatDate(endDate),
      });

      if (channel) {
        params.append('channel', channel);
      }

      // Try proxy first
      try {
        const response = await axios.get<AnalyticsData>(
          `${this.baseURL}/analytics/range?${params.toString()}`
        );
        return response.data;
      } catch (proxyError) {
        console.log('Proxy failed, trying direct URL...');
        // Fallback to direct URL
        const response = await axios.get<AnalyticsData>(
          `${this.directURL}/api/analytics/range?${params.toString()}`
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching analytics range:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Fetch analytics data for a specific date and channel
   */
  async fetchAnalyticsForDate(
    date: Date,
    channel?: string
  ): Promise<AnalyticsData> {
    try {
      const params = new URLSearchParams({
        start_date: this.formatDate(date),
        end_date: this.formatDate(date),
      });

      if (channel) {
        params.append('channel', channel);
      }

      // Try proxy first
      try {
        const response = await axios.get<AnalyticsData>(
          `${this.baseURL}/analytics/range?${params.toString()}`
        );
        return response.data;
      } catch (proxyError) {
        console.log('Proxy failed, trying direct URL...');
        // Fallback to direct URL
        const response = await axios.get<AnalyticsData>(
          `${this.directURL}/api/analytics/range?${params.toString()}`
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching analytics for date:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Fetch list of available channels
   */
  async fetchChannels(): Promise<ChannelsResponse> {
    try {
      // Try proxy first
      try {
        const response = await axios.get<ChannelsResponse>(
          `${this.baseURL}/analytics/channels/list`
        );
        return response.data;
      } catch (proxyError) {
        console.log('Proxy failed, trying direct URL...');
        // Fallback to direct URL
        const response = await axios.get<ChannelsResponse>(
          `${this.directURL}/api/analytics/channels/list`
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }

  /**
   * Format date to YYYY-MM-DD format
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get analytics data for the last N days
   */
  async fetchLastNDays(days: number, channel?: string): Promise<AnalyticsData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    
    return this.fetchAnalyticsRange(startDate, endDate, channel);
  }

  /**
   * Get analytics data for a specific month
   */
  async fetchMonthAnalytics(
    year: number,
    month: number,
    channel?: string
  ): Promise<AnalyticsData> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return this.fetchAnalyticsRange(startDate, endDate, channel);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
