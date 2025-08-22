import { dummyAnalyticsService } from '../dummyAnalyticsService';

describe('DummyAnalyticsService', () => {
  beforeEach(() => {
    // Reset any timers or mocks
    jest.clearAllTimers();
  });

  describe('fetchAnalyticsRange', () => {
    it('should generate analytics data for a date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const result = await dummyAnalyticsService.fetchAnalyticsRange(startDate, endDate);
      
      expect(result.success).toBe(true);
      expect(result.dailyData).toHaveLength(7);
      expect(result.summary.totalViews).toBeGreaterThan(0);
      expect(result.summary.totalRevenue).toBeGreaterThan(0);
      expect(result.implementation).toBe('dummy');
    });

    it('should handle single day requests', async () => {
      const date = new Date('2024-01-01');
      
      const result = await dummyAnalyticsService.fetchAnalyticsRange(date, date);
      
      expect(result.success).toBe(true);
      expect(result.dailyData).toHaveLength(1);
      expect(result.dateRange.days).toBe(1);
    });

    it('should include channel information when specified', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');
      const channel = 'test-channel-id';
      
      const result = await dummyAnalyticsService.fetchAnalyticsRange(startDate, endDate, channel);
      
      expect(result.channel).toBe(channel);
    });
  });

  describe('fetchChannels', () => {
    it('should return a list of sample channels', async () => {
      const result = await dummyAnalyticsService.fetchChannels();
      
      expect(result.success).toBe(true);
      expect(result.channels).toHaveLength(4);
      expect(result.total).toBe(4);
      
      // Check channel structure
      const firstChannel = result.channels[0];
      expect(firstChannel).toHaveProperty('id');
      expect(firstChannel).toHaveProperty('name');
      expect(firstChannel).toHaveProperty('analytics');
      expect(firstChannel.analytics).toHaveProperty('totalViews');
      expect(firstChannel.analytics).toHaveProperty('totalRevenue');
      expect(firstChannel.analytics).toHaveProperty('averageRPM');
    });
  });

  describe('generatePerformanceTrends', () => {
    it('should generate performance data with specified number of days', () => {
      const days = 14;
      const result = dummyAnalyticsService.generatePerformanceTrends(days);
      
      expect(result.labels).toHaveLength(days);
      expect(result.views).toHaveLength(days);
      expect(result.engagement).toHaveLength(days);
      expect(result.revenue).toHaveLength(days);
      
      // Check that data shows growth trend
      const firstView = result.views[0];
      const lastView = result.views[days - 1];
      expect(lastView).toBeGreaterThan(firstView * 0.8); // Allow some variation
    });

    it('should use default 30 days when no parameter provided', () => {
      const result = dummyAnalyticsService.generatePerformanceTrends();
      
      expect(result.labels).toHaveLength(30);
      expect(result.views).toHaveLength(30);
    });
  });

  describe('generateRealtimeData', () => {
    it('should generate real-time performance metrics', () => {
      const result = dummyAnalyticsService.generateRealtimeData();
      
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('last24h');
      expect(result).toHaveProperty('last48h');
      expect(result).toHaveProperty('last7Days');
      
      // Check that values are reasonable
      expect(result.current).toBeGreaterThan(1000000);
      expect(result.last24h).toBeGreaterThan(0);
      expect(result.last48h).toBeGreaterThan(0);
      expect(result.last7Days).toBeGreaterThan(0);
    });
  });

  describe('generateRecentActivity', () => {
    it('should generate recent activity feed', () => {
      const result = dummyAnalyticsService.generateRecentActivity();
      
      expect(result).toHaveLength(4);
      
      // Check activity structure
      const firstActivity = result[0];
      expect(firstActivity).toHaveProperty('id');
      expect(firstActivity).toHaveProperty('type');
      expect(firstActivity).toHaveProperty('title');
      expect(firstActivity).toHaveProperty('description');
      expect(firstActivity).toHaveProperty('timestamp');
      expect(firstActivity).toHaveProperty('channel');
      expect(firstActivity).toHaveProperty('views');
      expect(firstActivity).toHaveProperty('revenue');
    });
  });

  describe('generateGoals', () => {
    it('should generate progress tracking goals', () => {
      const result = dummyAnalyticsService.generateGoals();
      
      expect(result).toHaveLength(3);
      
      // Check goal structure
      const firstGoal = result[0];
      expect(firstGoal).toHaveProperty('title');
      expect(firstGoal).toHaveProperty('current');
      expect(firstGoal).toHaveProperty('target');
      expect(firstGoal).toHaveProperty('unit');
      expect(firstGoal).toHaveProperty('color');
      
      // Check that current values are less than targets
      result.forEach(goal => {
        expect(goal.current).toBeLessThanOrEqual(goal.target);
      });
    });
  });

  describe('API simulation', () => {
    it('should simulate realistic API delays', async () => {
      const startTime = Date.now();
      
      await dummyAnalyticsService.fetchAnalyticsRange(
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should have some delay (at least 100ms for realistic simulation)
      expect(duration).toBeGreaterThan(100);
    });
  });
});
